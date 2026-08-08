# MacroFactor Explorer

Visualizador personal de densidad calórica — Next.js + Clerk + Supabase.

## Stack

- **Next.js 15** (App Router)
- **Clerk** — autenticación con Google
- **Supabase** — base de datos PostgreSQL
- **Stripe Projects** — gestión de credenciales y servicios

---

## Setup con Stripe Projects (recomendado)

```bash
# 1. Instalar Stripe CLI y el plugin
brew install stripe/stripe-cli/stripe
stripe plugin install projects

# 2. Inicializar el proyecto (en esta carpeta)
stripe projects init macrofactor-explorer

# 3. Conectar servicios
stripe projects add clerk/auth
stripe projects add supabase/database
stripe projects add vercel/project

# 4. Sincronizar variables de entorno
stripe projects env --pull
# → Genera .env.local automáticamente

# 5. Instalar dependencias y correr
npm install
npm run dev
```

---

## Setup manual (alternativo)

```bash
cp .env.example .env.local
# Llenar las variables con tus keys de Clerk, Supabase y Vercel
npm install
npm run dev
```

---

## Base de datos

Después de crear el proyecto en Supabase, corre el migration:

```bash
# En el SQL Editor de Supabase, pega el contenido de:
supabase/migration.sql
```

---

## Importar datos de MacroFactor

1. Exporta desde MacroFactor → **Food Log** como Excel
2. Corre el script de procesamiento:
   ```bash
   node scripts/process-macrofactor.js tu-export.xlsx
   # → genera foods.json
   ```
3. En la app, click en **↑ Importar datos** y selecciona `foods.json`

### Por qué no hay importación automática (agosto 2026)

MacroFactor no expone una API pública. Investigamos todas las vías de
acceso programático conocidas y ninguna es viable para una
sincronización automatizada:

- **Sin API oficial** — la documentación solo menciona Apple Health
  (iOS) y Health Connect (Android); sin OAuth, claves de API, ni
  acceso para partners.
- **Clientes reverse-engineered de Firestore rotos** — en mayo de 2026
  Stronger By Science activó Firebase App Check, así que todo cliente
  de terceros que hablaba directamente con Firestore ahora recibe
  `401` (ver `benthecarman/macro-factor-rs` y `sjawhar/macrofactor`,
  este último archivado por esa razón).
- **El puente con iOS Shortcuts no resuelve la lectura** — automatiza
  las *escrituras* (`Log by JSON`), pero las *lecturas* siguen
  requiriendo exportación manual. La variante que reintenta Firestore
  con un App Check token relayado desde el iPhone es especulativa:
  App Attest solo puede emitir tokens desde la app oficial.
- **Apple Health es insuficiente** — MacroFactor sincroniza calorías,
  macros, micros y peso, pero **no** el trend weight, el TDEE adaptativo
  ni los datos de coaching, que son los valores centrales de este
  dashboard.

Mientras no exista una API oficial, el flujo manual de exportar → subir
es la única vía confiable (ver issue #8 para el seguimiento).

---

## Deploy

Vercel detecta Next.js automáticamente. Con Stripe Projects:

```bash
stripe projects open vercel
```

O conecta el repo manualmente en vercel.com → New Project → Import from GitHub.

Variables de entorno requeridas en Vercel:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
