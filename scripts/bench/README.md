# Benchmarks de latencia DB — referencia

Scripts de medición usados para diagnosticar la lentitud percibida en las
consultas. **No son código de producción ni tests.** Se conservan como
referencia para re-medir tras cambios de infraestructura (p. ej. co-locar
Vercel en `pdx1`, migrar región de Supabase, evaluar otro pooler).

## Cómo correrlos

Leen `DATABASE_URL` y `DIRECT_URL` de `.env` (ninguna credencial está
hardcodeada). Desde la raíz del proyecto:

```bash
TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS","moduleResolution":"node"}' \
  node --env-file=.env -r ts-node/register/transpile-only scripts/bench/<script>.ts
```

## Qué hace cada uno

| Script | Mide |
|---|---|
| `measure.ts` | Timing por pantalla (dashboard, lista, detalle, historia). Separa `e.duration` (Postgres+red) de wall-clock (todo). La diferencia = overhead del ORM. 8 iteraciones, mediana + p95. |
| `breakdown.ts` | (1) TCP handshake crudo al host = latencia pura de red. (2) Desglose de los statements por operación (revela el wrapper `BEGIN`/`DEALLOCATE ALL`/`COMMIT` del pooler). (3) `SELECT 1` ×10 vía pooler `:6543` vs directo `:5432`. |
| `sql-audit.ts` | Captura el SQL crudo generado por pantalla y detecta N+1 / over-fetching. |

## Hallazgos clave (medidos desde dev, ~235ms de la máquina a us-west-2)

- **El ORM (Prisma) es ~0.5% del tiempo.** `e.duration` ≈ wall-clock.
- **~99% del tiempo es latencia de red × round-trips.** `SELECT 1` tarda lo
  mismo (~1110ms) que la query más pesada → el tiempo no está en los datos.
- **El pooler en transaction mode fuerza 4 round-trips por query** (wrapper
  transaccional). `SELECT 1`: 1161ms vía pooler vs 232ms vía directo (5×).
- **Cada pantalla genera 1 solo SELECT** (`relationLoadStrategy: "join"`).
  Cero N+1, cero over-fetching.

**Conclusión:** el cuello de botella es geográfico/red, no el ORM ni el SQL.
La acción de mayor impacto es co-locar las regiones (Vercel `pdx1` ↔ Supabase
`us-west-2`), no reemplazar Prisma.

> Nota: estos scripts duplican la lógica de las queries de las páginas reales.
> Si cambiás una query en la app, actualizá el script correspondiente antes de
> re-medir, o los números no reflejarán la realidad.
