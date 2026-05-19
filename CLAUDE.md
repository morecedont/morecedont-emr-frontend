# Morecedont — EMR Frontend

## 1. Descripción del proyecto

**Morecedont** ("Sonrisas Inteligentes") es una plataforma SaaS de **historias clínicas odontológicas** dirigida a doctores y clínicas dentales. Permite gestionar pacientes, levantar historias clínicas estructuradas (antecedentes médicos, examen dental, endodoncia, plan de tratamiento, pagos), compartir pacientes entre doctores y adjuntar archivos clínicos (radiografías, PDFs, DICOM).

El producto está en español y la audiencia principal es Latinoamérica (los enums de moneda incluyen `USD`, `VES`, `EUR`).

Este repositorio es el **frontend** (Next.js App Router) — la base de datos vive en Supabase (PostgreSQL gestionado), incluyendo Auth y Storage. No hay un backend separado: las mutaciones se hacen con **Server Actions** de Next.js que usan Prisma directamente contra Supabase Postgres.

## 2. Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | `16.2.1` |
| Runtime React | React + React DOM | `19.2.4` |
| Lenguaje | TypeScript (strict) | `^5` |
| Estilos | Tailwind CSS v4 (`@tailwindcss/postcss`) | `^4` |
| ORM | Prisma | `^6.19.2` |
| Auth + Storage + DB | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | ssr `^0.10.0`, js `^2.101.0` |
| Fechas | `date-fns` (con locale `es`) | `^3.6.0` |
| Iconos | Material Symbols Outlined (Google Fonts CDN) | — |
| Tipografía | Inter (body), Manrope (headlines) — `next/font/google` | — |
| Lint | ESLint 9 + `eslint-config-next` | — |

> **Importante:** esta versión de Next.js puede tener cambios incompatibles con lo que tu modelo conoce de entrenamiento. Antes de escribir código, leé la guía relevante en `node_modules/next/dist/docs/`. Atendé los avisos de deprecación.

## 3. Estructura del proyecto

```
morecedont-emr-frontend/
├── .claude/
│   ├── skills/
│   │   └── responsive-mobile-first/
│   │       └── SKILL.md            # Reglas mobile-first; auto-cargada al editar tsx/jsx
│   ├── hooks/
│   │   ├── post-write.sh           # Entrypoint del hook PostToolUse (Write|Edit)
│   │   └── responsive-check.sh     # Valida el skill anterior (BLOQUEA en error)
│   ├── settings.json               # Configura el hook PostToolUse
│   ├── auth_solve.md               # Notas históricas
│   ├── bugfix_prompts/             # Prompts de fixes pasados
│   └── implementations_prompts/    # Prompts originales de cada feature
├── CLAUDE.md                       # Este archivo
├── README.md                       # Boilerplate de create-next-app
├── doc/
│   ├── home_content.md             # Copy de la landing
│   └── schema.sql                  # DDL canónico (Postgres / Supabase)
├── design/                         # Mockups de Stitch
├── prisma/
│   ├── schema.prisma               # ÚNICO source-of-truth para tipos del cliente Prisma
│   └── seed.ts                     # No-op: los usuarios se crean vía Supabase Auth
├── prisma.config.ts                # Apunta a prisma/migrations (carpeta no existe)
├── public/                         # Assets estáticos (incluye hero-section-dental.jpg)
├── types/
│   └── supabase.d.ts               # Tipo Profile mínimo (legacy; preferir tipos de Prisma)
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: fuentes Inter + Manrope, Material Symbols
│   │   ├── page.tsx                # Landing pública en `/`
│   │   ├── globals.css             # Design system (Tailwind v4 + @theme inline)
│   │   ├── (home)/components/      # Secciones de la landing (Hero, Problem, etc.)
│   │   ├── (auth)/
│   │   │   ├── login/              # /login + LoginForm
│   │   │   └── register/
│   │   │       ├── page.tsx        # /register + RegisterForm
│   │   │       ├── pending/        # /register/pending (cuenta bajo revisión)
│   │   │       └── rejected/       # /register/rejected
│   │   └── (dashboard)/
│   │       ├── layout.tsx          # Carga el perfil y monta DashboardShell; redirige a /login
│   │       ├── components/         # DashboardShell, Sidebar, TopBar
│   │       ├── dashboard/          # /dashboard (home logueado: stats + recientes + timeline)
│   │       ├── patients/
│   │       │   ├── page.tsx        # Listado paginado con filtros y búsqueda
│   │       │   ├── components/     # PatientsTable, PatientsFilters, BottomStatsCards, SharePatientModal, Pagination
│   │       │   ├── new/            # Wizard de alta (NewPatientWizard + steps/Step1..Step6)
│   │       │   └── [id]/
│   │       │       ├── page.tsx    # Vista de paciente (header + historias + alergias + sidebar)
│   │       │       ├── components/ # Cards (Personal, Clinical, Emergency, AlertsDocuments, ProfileHeader, TreatmentHistoryList)
│   │       │       ├── edit/       # PatientEditForm
│   │       │       ├── files/      # /patients/[id]/files (galería agrupada por historia)
│   │       │       └── history/
│   │       │           ├── new/    # Crear nueva historia clínica
│   │       │           └── [historyId]/
│   │       │               ├── page.tsx        # Detalle de historia (HistoryHeader + HistoryTabs)
│   │       │               ├── components/
│   │       │               │   ├── HistoryHeader.tsx
│   │       │               │   ├── HistoryTabs.tsx
│   │       │               │   └── tabs/       # MedicalBackground, DentalExam, Endodontics, TreatmentPlan, Attachments
│   │       │               └── edit/           # EditHistoryWizard (mismo flujo que new pero con datos prellenados)
│   │       ├── clinics/             # Stub (solo `page.tsx` y `clinics/new`)
│   │       └── settings/            # Stub
│   ├── components/
│   │   └── shared/                 # Componentes compartidos entre rutas (ver §6)
│   └── lib/
│       ├── prisma.ts               # Singleton de PrismaClient (con `query`/`error`/`warn` log en dev)
│       ├── session.ts              # getSession() y getProfile() (Supabase + Prisma)
│       ├── storage.ts              # Wrappers server-only de Supabase Storage (signed URLs, delete)
│       ├── storage-utils.ts        # Utils puras (path, categoría MIME, formato bytes)
│       ├── supabase/
│       │   ├── client.ts           # createBrowserClient (uso en client components)
│       │   ├── server.ts           # createServerClient con cookies de Next
│       │   └── middleware.ts       # Helper para el middleware raíz
│       ├── actions/                # Server Actions (mutaciones)
│       │   ├── auth.ts             # signIn, signUp, signOut
│       │   ├── attachments.ts      # save/get/delete archivos
│       │   ├── clinics.ts          # search/create/associate clínicas
│       │   ├── patients.ts         # CRUD paciente, historia, antecedentes, examen, endo, plan…
│       │   └── payments.ts         # addPayment
│       └── constants/
│           └── endodontics.ts      # FILE_SIZES (limas), CANAL_CODES, CanalEntry type
├── middleware.ts                   # Middleware raíz: protege todo excepto la landing y rutas auth
├── next.config.ts                  # Config vacía (default Next 16)
├── eslint.config.mjs               # Flat config con next/core-web-vitals + next/typescript
├── postcss.config.mjs              # Solo @tailwindcss/postcss
├── tsconfig.json                   # alias `@/*` → `./src/*`
└── .env                            # DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_*, SUPABASE_SERVICE_ROLE_KEY
```

### Route groups

- `(home)` — landing pública en `/` (no es un segment, solo organiza los componentes).
- `(auth)` — `/login`, `/register`, `/register/pending`, `/register/rejected`.
- `(dashboard)` — área autenticada (`/dashboard`, `/patients`, etc.) con `layout.tsx` que requiere perfil activo.

## 4. Base de datos

### Convenciones generales

- **PostgreSQL en Supabase**, dos schemas: `auth` (gestionado por Supabase) y `public` (modelo de negocio).
- **PKs UUID** (`@db.Uuid` con `gen_random_uuid()`) en todas las tablas de negocio.
- **Timestamps:** `created_at` / `updated_at` siempre `Timestamptz(6)` con default `now()`.
- **Naming snake_case** para columnas y tablas (mapeado tal cual desde el modelo Prisma → DB).
- **Cascading deletes** activos: borrar un `medical_history` borra exámenes, endodoncias, attachments, etc.
- **Decimal money:** `Decimal(12,2)` para `cost`/`payment`/`balance`; `Decimal(5,2)` para mediciones (longitud de canal, % NaOCl).
- **`balance` en `treatment_payments`** es columna generada (`cost - payment`) — no escribir directamente.

### Modelo de dominio (schema `public`)

| Tabla | Rol |
|---|---|
| `profiles` | Extiende `auth.users` 1:1. Campos: `full_name`, `email`, `phone`, `role` (`doctor`/`admin`), `status` (`pending`/`active`/`rejected`), `license_number`, `specialty`, `rejection_reason`. **`status` por defecto es `'pending'`.** |
| `clinics` | Clínicas creadas por doctores (`created_by` → `profiles.id`). |
| `doctor_clinics` | M:N doctor↔clínica (PK compuesta). |
| `patients` | Paciente. `created_by` apunta al doctor que lo creó. Campos demográficos. |
| `doctor_patients` | M:N doctor↔paciente (PK compuesta). `shared_by`/`shared_at` indican quién compartió el paciente con otro doctor. **Esta tabla es el control de acceso a pacientes.** |
| `medical_histories` | Historia clínica. FK `patient_id`, `doctor_id`, `clinic_id?`. Una historia agrupa todo el resto. |
| `medical_backgrounds` | 1:1 con `medical_histories`. Decenas de `Boolean?` por sistema (cardio_*, resp_*, endo_*, neuro_*, gastro_*, renal_*, immun_*, blood_*, female_*, family_*). |
| `dental_exams` | 1:1 con `medical_histories`. Problemas (ATM, gingivitis…), `eruption_status`, diagnóstico, observaciones. |
| `tooth_records` | N por `dental_exams`. `tooth_number` + `vestibular_status` + `lingual_status` (enum `tooth_status`). UNIQUE `(dental_exam_id, tooth_number)`. |
| `endodontics` | N por `medical_histories`. Una entrada por diente tratado, con dolor, percusión, palpación, mobility, pulpa, instrumentación, obturación, lima inicial/final/longitud. |
| `endodontic_canals` | N por `endodontics`. Detalle de cada conducto (`canal_code`, `canal_label`, `reference`, `length_mm`). |
| `endodontic_sessions` | N por `endodontics`. Sesiones (`activity` enum: opening, biopulpectomy, …, distance_control). |
| `treatment_items` | Plan de tratamiento (item_number + description + cost). |
| `treatment_payments` | Pagos del tratamiento (date, tooth_unit, clinical_activity, cost, payment, balance generado). |
| `attachments` | N por `medical_histories`. `file_url` guarda la **path en el bucket** (no URL pública) + `file_type` + `description` (usado como nombre amigable). |

### Enums clave

- `user_role`: `doctor`, `admin`
- `currency_type`: `USD`, `VES`, `EUR`
- `tooth_status`: `healthy`, `decayed`, `extracted`, `restored`, `crowned`, `implant`, `missing`, `endodontic`
- `eruption_status`: `erupted`, `semi`, `not_erupted`
- `pain_type`, `pain_quality`, `pain_relief`, `percussion_result`, `mobility_grade`, `pulp_chamber_status`, `canal_status`, `periapical_status`, `instrumentation_type`, `obturation_type`, `endodontic_activity` (ver `prisma/schema.prisma` para valores).

### Migraciones — REGLA CRÍTICA

- **No existe carpeta `prisma/migrations/`** y `prisma/seed.ts` es un no-op.
- **El DDL canónico vive en `doc/schema.sql`** y se aplica manualmente en Supabase (SQL Editor) cuando se modifica.
- `prisma.config.ts` apunta a `prisma/migrations` para futuro uso, pero **hoy las migraciones se gestionan manualmente**.
- `npm run build` ejecuta `prisma generate && next build` — sólo regenera el cliente, **no aplica DDL**.
- **NUNCA correr `prisma migrate dev`, `prisma migrate deploy`, `prisma db push` ni `prisma db pull` automáticamente.** Si necesitás un cambio de schema: editá `prisma/schema.prisma`, escribí el SQL equivalente, y pedí confirmación al usuario antes de tocar la base.

### Quirks Prisma ↔ Supabase

- `schema.prisma` declara `schemas = ["auth", "public"]` y modela todo el namespace `auth` (users, sessions, MFA, oauth, etc.). **No tocar las tablas de `auth`** — las administra Supabase Auth.
- `DATABASE_URL` usa el pooler (`pgbouncer=true`, puerto 6543) y `DIRECT_URL` el puerto 5432 (necesario para introspección/migraciones).
- Varias tablas tienen RLS activo en producción. Si una query Prisma server-side falla con "permission denied", probablemente sea RLS — usar el `service_role` o ajustar la policy, no deshabilitar RLS.

## 5. Autenticación

Stack: **Supabase Auth** (cookies via `@supabase/ssr`) + tabla `profiles` con flag `status`.

### Clientes Supabase (3 variantes)

| Archivo | Cuándo usar |
|---|---|
| `src/lib/supabase/client.ts` → `createClient()` | Client Components (browser). Usa `createBrowserClient`. |
| `src/lib/supabase/server.ts` → `createClient()` (async) | Server Components y Server Actions. Lee/escribe cookies vía `next/headers`. |
| `src/lib/supabase/middleware.ts` → `createMiddlewareClient(req)` | Sólo desde el `middleware.ts` raíz. |

Todos consumen `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Flujo de registro de doctor

1. `RegisterForm` (client) → server action `signUp({ fullName, email, phone, password, licenseNumber, specialty })` (`src/lib/actions/auth.ts`).
2. `supabase.auth.signUp({ email, password })` crea el `auth.users` row.
3. Inmediatamente se crea `profiles` vía Prisma con `status: "pending"` y `role: "doctor"`.
4. `redirect("/register/pending")`.

Estados posibles del perfil:
- `pending` → middleware fuerza la URL a `/register/pending`.
- `rejected` → middleware fuerza `/register/rejected` (con `rejection_reason` opcional).
- `active` (cualquier otro valor) → acceso normal al dashboard.

> El paso pending → active **lo hace un admin manualmente en Supabase** (no hay panel de admin aún).

### Login / Logout

- `signIn(email, password)` → `signInWithPassword` → `redirect("/dashboard")`.
- `signOut()` → `redirect("/login")`.

### Protección de rutas (`middleware.ts` raíz)

`matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]` — el middleware corre sobre todas las páginas.

Lógica:
1. Sin sesión → permite `/`, `/login`, `/register`, `/register/pending`, `/register/rejected`. Cualquier otra ruta redirige a `/login`.
2. Con sesión y `status=pending` → fuerza `/register/pending`.
3. Con sesión y `status=rejected` → fuerza `/register/rejected`.
4. Con sesión y status activo → si está en `/login` o `/register`, redirige a `/dashboard`.

Adicionalmente, el layout `(dashboard)/layout.tsx` revalida con `getProfile()` y redirige a `/login` si no hay perfil. Las páginas server-side individuales hacen su propia verificación de **acceso al recurso** (p. ej. `prisma.doctor_patients.findUnique` antes de servir un paciente).

### Helpers de sesión (`src/lib/session.ts`)

- `getSession()` → devuelve la session de Supabase.
- `getProfile()` → devuelve el `profiles` row (vía Prisma) o `null`. Es el helper canónico para Server Components y Server Actions.

## 6. Componentes clave

### Compartidos — `src/components/shared/`

| Componente | Props relevantes | Propósito |
|---|---|---|
| `FileUploader` | `medicalHistoryId`, `patientId`, `doctorId`, `onUploadComplete(att)` | Drop-zone + `<input type=file multiple>`. Sube directo al bucket `clinical-records` desde el browser, luego llama a `saveAttachment` server action. Valida MIME (jpeg/png/webp/pdf/dicom/.dcm) y tamaño máx **150 MB**. |
| `AttachmentViewer` | `attachments: AttachmentRecord[]`, `patientId`, `canDelete`, `onDelete(id)` | Grid responsivo de tarjetas (imagen/PDF/DICOM/otro). Click en "Ver" abre `FilePreviewModal`. "Bajar" descarga via signed URL. "Eliminar" pide confirmación. |
| `FilePreviewModal` | `isOpen`, `file`, `allFiles`, `onClose`, `onNavigate` | Modal full-screen con navegación prev/next entre archivos previewables. |
| `PatientFilesGallery` (en `patients/[id]/files/`) | `patient`, `attachments: PatientAttachmentRecord[]`, `patientId` | Galería de **todos** los archivos del paciente, agrupados por historia, con filtros (Todos / Imágenes / PDFs / DICOM). |
| `CanalRow` | `canal: CanalEntry`, `index`, `onChange`, `onRemove`, `readOnly?` | Fila para editar un conducto endodóntico (código, label custom, referencia, longitud, notas). Layout dual: stacked en mobile, horizontal en `md+`. |
| `FileInstrumentation` | `instrumentationType`, `fileInitial`, `fileFinal`, `fileLength`, `fileNotes` + handlers, `readOnly?` | Selector de tipo (manual/rotatoria) + secuencia de limas (calcula la secuencia desde `FILE_SIZES`). |
| `ClinicSelector` | `value: SelectedClinic \| null`, `doctorId`, `onChange`, `placeholder?` | Combobox: busca clínicas por nombre con debounce, muestra "propias" arriba, permite crear nueva al vuelo (server actions `searchClinics` / `createClinic` / `associateClinic`). |
| `Odontogram` | `toothRecords: ToothRecord[]`, callbacks de cambio | Diagrama dental para marcar status vestibular/lingual por diente. |
| `PatientAvatar` | `fullName`, `size?`, `showStatusDot?`, `isActive?` | Iniciales coloreadas determinísticamente por hash del nombre. Tamaños: `sm`, `md`, `lg`, `xl`. |

### Dashboard shell — `src/app/(dashboard)/components/`

- `DashboardShell` — frame con `Sidebar` y `TopBar`.
- `Sidebar` — navegación (Inicio, Pacientes; Clínicas/Settings ocultos por flag `hidden: true`).
- `TopBar` — header con saludo, búsqueda y menú de usuario.

### Wizard de paciente — `src/app/(dashboard)/patients/new/steps/`

`NewPatientWizard` orquesta 6 pasos: PersonalData → EmergencyContact → MedicalBackground → DentalExam → Endodontics → TreatmentPlan. El layout es controlado, todos los datos viven en estado del wizard hasta el submit final.

`EditHistoryWizard` reusa el mismo árbol de pasos pero precargado para una historia existente.

## 7. Convenciones de código

### Mutaciones: **siempre Server Actions**

- No hay `app/api/*` route handlers. Todas las mutaciones viven en `src/lib/actions/*.ts` con `"use server"` al tope.
- Forma estándar: la action devuelve `{ error?: string, ...payload }` (no lanza). El cliente la consume con `useTransition`.
- Cada action verifica autorización con `getProfile()` y luego con una query a `doctor_patients` (para acceso a paciente) o `medical_histories.doctor_id === profile.id` (para acceso a recurso clínico).
- Después de mutar, llaman `revalidatePath("/patients/...")` para invalidar el cache.

Ejemplo del patrón (de `attachments.ts`):
```ts
"use server"
const profile = await getProfile()
if (!profile) return { error: "No autorizado" }
const history = await prisma.medical_histories.findUnique({ where: { id } })
if (!history || history.doctor_id !== profile.id) return { error: "No autorizado" }
// ...mutación...
revalidatePath(`/patients/${patientId}`)
return { success: true }
```

### Fetching de datos

- **Server Components** son la norma para datos de lectura: usan `prisma` directo + `getProfile()`.
- Pasan **objetos planos serializables** a Client Components (ISO strings para fechas, números para `Decimal`, etc.).
- `searchParams` y `params` en Next 16 son **Promises** y deben `await`-earse: `const { id } = await params`.

### Manejo de errores

- Server actions: devuelven `{ error: string }`, nunca lanzan al cliente.
- Páginas server-side: `notFound()` cuando el recurso no existe o el doctor no tiene acceso, `redirect("/login")` cuando no hay sesión.
- Errores en consola con `console.error("contexto:", err)` antes de devolver mensaje genérico al usuario.

### Estilos

- Tailwind v4 con tokens de design system definidos en `src/app/globals.css` (`@theme inline`). Usar las clases tokenizadas (`bg-primary`, `text-on-surface`, `bg-surface-container-low`, `text-error`, `bg-sidebar`…).
- **No usar hex hardcoded** (el hook bloquea `bg-[#…]`, `text-[#…]`, `border-[#…]`).
- **No usar `style={{}}`** (el hook lo bloquea, salvo el caso ya existente de `font-variation-settings` para Material Symbols — preferir clases utilitarias `material-symbols-filled`).
- Iconos: `<span className="material-symbols-outlined">nombre_icono</span>`. La fuente se carga vía `<link>` en `app/layout.tsx`.

### Mobile-first (skill `responsive-mobile-first`)

Las reglas viven en `.claude/skills/responsive-mobile-first/SKILL.md` y Claude Code las carga automáticamente al editar tsx/jsx. Resumen ejecutable:
- Inputs SIEMPRE con `text-base` (anti-zoom iOS).
- Sin `w-[Npx]`, sin `<img>` nativo (usar `next/image`), sin grids que arranquen en `grid-cols-2+` sin `grid-cols-1` base.
- Botones con altura mínima `h-11` (44 px).
- Sin hex hardcoded (`bg-[#…]`) — usar tokens del design system.
- Sin `style={{}}` inline.

El hook `.claude/hooks/responsive-check.sh` (PostToolUse) valida y **bloquea** la escritura si falla alguna regla dura. Leer el skill antes de generar código evita reescritura.

### Tipado

- TS strict; alias `@/*` → `src/*`.
- Tipos del cliente Prisma se generan en `npm run build` (`prisma generate`). Importar enums con `import { Prisma } from "@prisma/client"` y usar `Prisma.QueryMode.insensitive` para búsquedas case-insensitive.
- `types/supabase.d.ts` está casi vacío y es legacy — preferir tipos de Prisma (`Profile`, `patients`, etc.).

### `"use client"` y `"use server"`

- `"use client"` solo en componentes que usan hooks/handlers/estado.
- `"use server"` al tope de cualquier archivo en `src/lib/actions/`.
- `src/lib/storage-utils.ts` es **puro** (sin directiva) — se puede importar desde ambos lados. `src/lib/storage.ts` es server-only (importa `createServerClient`).

## 8. Storage (Supabase Storage)

- **Bucket único:** `clinical-records` (constante `BUCKET` en `src/lib/storage.ts`, también `STORAGE_BUCKET` en `storage-utils.ts`).
- **Path convention:** `{doctorId}/{patientId}/{historyId}/{timestamp}_{nombre_sanitizado}`. Construido por `buildStoragePath()` (sanitiza a `[a-zA-Z0-9._-]`, lowercase).
- **Upload:** desde el client, usando `createClient()` (browser) y `supabase.storage.from("clinical-records").upload(path, file, { upsert: false })`. Luego una server action `saveAttachment` registra el row en `attachments` con `file_url = path` (NO la URL pública).
- **Lectura:** server-only via `getSignedUrl(path)` o `getSignedUrls(paths[])` en `src/lib/storage.ts`. Las signed URLs expiran en **3600 s (1 hora)**.
- **Borrado:** `deleteStorageFile(path)` + `prisma.attachments.delete()`. Solo el doctor que subió el archivo puede eliminarlo (validación en `deleteAttachment`).
- **Tipos permitidos:** `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, `application/dicom`, `.dcm` (extensión).
- **Tamaño máx:** 150 MB por archivo (validado client-side en `FileUploader`).

## 9. Comandos de desarrollo

```bash
npm run dev      # next dev (http://localhost:3000)
npm run build    # prisma generate && next build
npm run start    # next start (producción)
npm run lint     # eslint
```

No hay scripts de seed, test ni typecheck dedicado. `tsc --noEmit` puede ejecutarse manualmente.

### Variables de entorno requeridas

- `DATABASE_URL` — conexión pooled (pgbouncer) a Supabase.
- `DIRECT_URL` — conexión directa (puerto 5432).
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; no usado actualmente en el código pero presente).
- `AUTH_URL`, `AUTH_SECRET` — legacy de un intento de NextAuth, **ya no se usan**.

## 10. Reglas críticas — lo que NUNCA hay que hacer

1. **Nunca correr `prisma migrate ...` ni `prisma db push`** automáticamente. El DDL se aplica manualmente en Supabase desde `doc/schema.sql`. Cualquier cambio de schema requiere edición de `schema.prisma` + SQL escrito + confirmación del usuario.
2. **Nunca reintroducir NextAuth.** El proyecto migró a Supabase Auth. `AUTH_URL`/`AUTH_SECRET` en `.env` son residuales.
3. **Nunca tocar tablas del schema `auth`** desde Prisma (users, sessions, mfa_*, oauth_*…). Las administra Supabase.
4. **Nunca deshabilitar RLS** para resolver un "permission denied". Las tablas de `public` tienen RLS activo en producción. Si necesitás bypass server-side, usar el cliente `service_role` (no implementado aún) o ajustar la policy.
5. **Nunca subir archivos con URLs públicas.** El bucket `clinical-records` es privado — siempre signed URLs (1 h).
6. **Nunca guardar URLs absolutas en `attachments.file_url`** — siempre el path relativo del bucket.
7. **Nunca crear `app/api/*` route handlers para mutaciones.** Usar Server Actions en `src/lib/actions/`.
8. **Nunca asumir formato de Next.js anterior** (App Router pre-15). En Next 16:
   - `params` y `searchParams` son `Promise<...>` y deben `await`-earse.
   - `cookies()` (de `next/headers`) es `async`.
   - Si dudás, leé `node_modules/next/dist/docs/`.
9. **Nunca violar las reglas mobile-first** del skill `responsive-mobile-first` (`.claude/skills/responsive-mobile-first/SKILL.md`). El hook `.claude/hooks/responsive-check.sh` corre en `PostToolUse` (Write|Edit) y bloquea: `w-[Npx]`, inputs sin `text-base`, `style={{}}`, `<img>` nativo, hex hardcoded.
10. **Nunca cambiar el flujo de status del perfil** (`pending`/`active`/`rejected`) sin entender el middleware. El middleware redirige por status; cambiarlo del lado client puede dejar usuarios atrapados en bucles.
11. **Nunca eliminar archivos de un paciente al que el doctor no subió personalmente** — la server action `deleteAttachment` ya enforce `attachment.medical_histories.doctor_id !== profile.id` rechaza.
12. **Nunca crear pacientes sin crear también `doctor_patients`.** El acceso al paciente depende de esa relación; sin ella el doctor pierde visibilidad sobre el recién creado. Ver `createPatient` en `src/lib/actions/patients.ts`.
13. **Nunca pasar Decimals de Prisma directo a Client Components** — convertir a `number` o `string` antes (no son JSON-serializables).

## 11. Estado actual del proyecto

### Implementado

- Landing pública (`/`) con todas las secciones (Hero, Problem, WhatIs, Benefits, HowItWorks, ForWhom, FAQ, CTA, Footer).
- Auth completo: registro de doctor con `pending` status, login, logout, middleware de protección, páginas pending/rejected.
- Dashboard home con stats (`totalPatients`, `recentConsultations`), tabla de pacientes recientes y timeline clínico.
- Listado de pacientes con búsqueda, filtros (clínica, estado), paginación; tarjetas de stats al pie; modal "Compartir paciente" (`SharePatientModal`).
- Wizard de alta de paciente en 6 pasos (Personal → Emergency → MedicalBackground → DentalExam → Endodontics → TreatmentPlan).
- Vista de paciente (`/patients/[id]`): header, lista paginada de historias, alertas (alergia, sangrado fácil), últimos archivos, sidebar (info personal, contacto emergencia, info clínica).
- Edición de paciente (`/patients/[id]/edit`).
- Historia clínica detallada (`/patients/[id]/history/[historyId]`) con tabs: MedicalBackground, DentalExam, Endodontics, TreatmentPlan, Attachments.
- Edición de historia clínica completa (`EditHistoryWizard`) reusando los steps del wizard de alta.
- Selector de clínica (`ClinicSelector`) con búsqueda, creación al vuelo y asociación a doctor.
- Subida de archivos clínicos: client-side upload a Supabase Storage + metadata server action + signed URLs.
- Galería de archivos del paciente (`/patients/[id]/files`) agrupada por historia con filtros por tipo.
- Antecedentes familiares (familia: hipertensión, diabetes, cardio, cáncer, renal, mental, otro).

### Pendiente / stub

- `/clinics` y `/clinics/new` — solo placeholder pages.
- `/settings` — solo placeholder.
- Aprobación administrativa de doctores (transición `pending → active`) no tiene UI; se hace manualmente en Supabase.
- No hay admin panel.
- No hay tests ni typecheck en CI.
- Notificaciones por email del cambio de status (mencionadas en el copy de `/register/pending`) no están implementadas.
