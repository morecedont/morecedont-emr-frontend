# Prompt para Claude Code — Optimización de rendimiento + Disk IO (Morecedont EMR)

## Contexto y diagnóstico ya confirmado

Morecedont es un EMR dental (Next.js 16 App Router + Supabase + Prisma + Tailwind). Síntomas:
1. Cada navegación (`<Link>`) re-renderiza en el server y re-ejecuta todas las queries desde cero — se siente lento.
2. Supabase está agotando el Disk IO Budget.

**Diagnóstico de base de datos YA REALIZADO (no re-investigar):**
- Cache hit rate: index 99.86%, table 99.80% → memoria suficiente, NO falta compute.
- Todas las tablas están bien indexadas (doctor_id, patient_id, medical_history_id, etc. ya tienen índices).
- La base es de desarrollo (0–11 filas por tabla). Los seq_scans observados son intencionales de Postgres sobre tablas diminutas y NO consumen IO real.
- Pooling correcto: `DATABASE_URL` por pgbouncer (6543, transaction mode) + `DIRECT_URL` directo (5432).

**Conclusión:** el problema NO es la base de datos ni los índices ni el compute. Es que la APP re-ejecuta queries innecesariamente en cada navegación. El re-render lento y el Disk IO agotado son el mismo desperdicio medido en dos lugares. Todo el trabajo es del lado de la app: reducir cuántas veces consultamos y evitar bloquear el render.

Resolvemos en 5 fases ordenadas. **Ejecuta una fase, detente, y espera mi confirmación antes de la siguiente.** No saltes fases.

## Reglas inquebrantables (todas las fases)

- **NUNCA ejecutes migraciones de base de datos** ni `CREATE INDEX` ni DDL. Si algo requiere cambio de schema, escribe el SQL aparte y dímelo — yo lo corro en el Supabase SQL Editor.
- **NO hay que crear índices** — ya están todos. No toques el schema.
- **NUNCA sirvas datos de pacientes (PHI) desde caché desactualizado.** Por HIPAA, datos clínicos siempre frescos. El caché solo aplica a catálogos no sensibles (clínicas, protocolos de irrigación, soluciones, constantes).
- Mantén Server Components + RLS de Supabase como garantía de seguridad para datos sensibles.
- Respeta `RESPONSIVE.md` y el hook `.claude/hooks/responsive-check.sh`.
- App Router puro: nunca `getServerSideProps` / `getStaticProps`. Usa `cookies()` de `next/headers`.
- **Antes de modificar cualquier archivo, inspecciónalo y muéstrame el patrón actual.** No asumas la estructura.
- Después de cada fase, resume qué archivos tocaste y por qué.

---

## FASE 0 — Auditoría (solo lectura, no modifiques nada todavía)

Antes de optimizar, mapea el problema real:

1. Lista todos los Server Components del grupo `(dashboard)` (páginas, layouts) y para cada uno anota: qué queries de Prisma ejecuta, si son secuenciales o paralelas, y si `getProfile()` se llama más de una vez en el árbol de esa ruta.
2. Identifica cuántas queries totales dispara cada navegación de pantalla a pantalla.
3. Reporta el inventario en una tabla. NO modifiques código aún. Detente y espera mi confirmación.

---

## FASE 1 — Eliminar waterfalls de queries (impacto inmediato, riesgo cero)

**Objetivo:** paralelizar queries independientes que hoy corren secuencialmente.

1. En cada Server Component con múltiples `await` de datos independientes, refactoriza a `Promise.all`. `getProfile()` resuelve primero (las demás dependen de `profile.id`); el resto en paralelo:

   ```ts
   const profile = await getProfile()
   if (!profile) redirect('/login')

   const [totalPatients, recentConsultations, recentPatients] = await Promise.all([
     prisma.doctor_patients.count({ where: { doctor_id: profile.id } }),
     prisma.medical_histories.count({ where: { doctor_id: profile.id, created_at: { gte: subDays(new Date(), 30) } } }),
     prisma.doctor_patients.findMany({ /* ...existing... */ }),
   ])
   ```

2. Aplica en TODAS las páginas con múltiples queries independientes: lista de pacientes, detalle, galería de archivos, módulo endodóntico.
3. Donde haya dependencia real entre queries, mantén el orden — solo paraleliza lo independiente.

**Entregable:** lista de archivos modificados con cuántas queries pasaron de secuencial a paralelo. Detente.

---

## FASE 2 — Deduplicar getProfile() con React cache()

**Objetivo:** que `getProfile()` corra UNA vez por request aunque se llame en layout + page + componentes. Esto reduce directamente operaciones IO.

1. En `src/lib/session.ts`, envuelve `getProfile()` (y `getSession()` si aplica) con `cache` de React:

   ```ts
   import { cache } from 'react'
   export const getProfile = cache(async () => { /* lógica existente */ })
   ```

2. Es deduplicación por-request (request memoization), NO caché persistente — cada navegación vuelve a ejecutar, sin riesgo de PHI viejo. Solo evita que la misma request consulte el perfil 3 veces.
3. Verifica que el redirect a `/login` siga funcionando.

**Entregable:** confirmar el wrap y que el auth sigue OK. Detente.

---

## FASE 3 — Streaming con Suspense + skeletons (mayor mejora percibida)

**Objetivo:** mostrar el shell instantáneo y que cada bloque llegue en stream, en vez de bloquear toda la página.

1. Crea `loading.tsx` por ruta principal (`dashboard`, `patients`, `patients/[id]`, `patients/[id]/files`, `patients/new` si aplica). Skeletons con Tailwind `animate-pulse` que imiten el layout real. Respeta `RESPONSIVE.md`.

2. Refactoriza páginas pesadas: cada bloque de datos independiente en su propio `<Suspense>`, con el fetch DENTRO del componente hijo:

   ```tsx
   export default async function DashboardPage() {
     const profile = await getProfile()
     if (!profile) redirect('/login')
     return (
       <>
         <Suspense fallback={<StatsCardsSkeleton />}>
           <StatsCards doctorId={profile.id} />
         </Suspense>
         <Suspense fallback={<RecentPatientsSkeleton />}>
           <RecentPatientsTable doctorId={profile.id} />
         </Suspense>
       </>
     )
   }
   ```

3. NO metas todo en un Suspense gigante — un boundary por bloque independiente.
4. Mantén separación cliente/servidor: interactividad en Client Component hijo, fetch en el padre Server Component.

**Entregable:** lista de `loading.tsx` creados y páginas refactorizadas. Detente.

---

## FASE 4 — Caché selectivo SOLO para datos no sensibles (no PHI)

**Objetivo:** cachear catálogos que casi no cambian y NO son PHI, reduciendo IO repetido. Esto ataca directamente el Disk IO budget.

1. Identifica funciones de fetch de datos NO sensibles y de baja frecuencia de cambio:
   - Lista de clínicas del doctor
   - Catálogos/constantes de protocolos de irrigación, soluciones endodónticas, códigos de conductos
   - Cualquier tabla de referencia estática

2. Para esas funciones (SOLO esas), aplica `"use cache"` de Next.js 16 con `cacheLife` razonable:

   ```ts
   async function getClinics(doctorId: string) {
     'use cache'
     cacheLife('hours')
     return prisma.clinics.findMany({ where: { doctor_id: doctorId } })
   }
   ```

3. **CRÍTICO — NO apliques `"use cache"` a NINGUNA función que devuelva:**
   - Datos de pacientes (`patients`, `doctor_patients`)
   - Historias clínicas (`medical_histories`)
   - Adjuntos / archivos clínicos (`attachments`)
   - Exámenes dentales, tooth_records, endodontics, treatment_items/payments
   - Cualquier PHI o dato que un doctor espere ver en tiempo real.

4. Donde haya mutaciones que afecten datos cacheados (crear/editar clínica), invalida con `revalidateTag` o `revalidatePath`.

**Entregable:** lista de funciones con `"use cache"`, confirmación EXPLÍCITA de que ninguna toca PHI, e invalidaciones agregadas. Detente.

---

## FASE 5 — Afinar Prisma para pgbouncer (transaction mode)

**Objetivo:** reducir overhead de conexión que también consume IO.

1. Verifica que `src/lib/prisma.ts` use el singleton correcto (un solo `PrismaClient` reutilizado, no uno nuevo por request). Si en dev se recrea por hot-reload, usa el patrón `globalThis`.

2. Confirma que `DATABASE_URL` (pooler 6543) tiene `pgbouncer=true` y considera agregar `connection_limit` razonable para serverless (ej. `connection_limit=1` por instancia serverless, o el valor que corresponda a tu hosting). NO cambies el valor sin confirmarme — solo dime qué recomiendas y por qué.

3. Reporta si detectas algún lugar donde se instancie `new PrismaClient()` fuera del singleton (fuga de conexiones).

**Entregable:** estado del singleton, recomendación de `connection_limit`, y cualquier fuga detectada. Detente.

---

## Después de las 5 fases

Resumen final con:
- Mejora esperada en navegación y en Disk IO (antes: re-ejecución completa por Link; después: dedup + paralelo + streaming + caché de catálogos).
- Recomendación de monitorear el Disk IO Budget en Supabase tras desplegar, para confirmar que bajó.
- Evaluación (NO ejecución) de si conviene migrar a Prisma 7 a futuro (query engine puro-TS, ~3x más rápido que el engine Rust de Prisma 6). Solo reporta, no migres.

**No ejecutes migración de Prisma 7, ni CREATE INDEX, ni ninguna migración de DB en este trabajo.**