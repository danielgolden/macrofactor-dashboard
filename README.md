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
