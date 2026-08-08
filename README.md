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

### Por qué no hay importación automática (a fecha de agosto 2026)

MacroFactor no expone una API pública ni un programa de desarrolladores.
Investigamos todas las vías de acceso programático conocidas y ninguna es
viable para una sincronización automatizada en este momento:

- **Sin API oficial.** La documentación de integraciones
  (`help.macrofactorapp.com/en/articles/102-integrations`) solo menciona
  Apple Health (iOS) y Health Connect (Android). Sin OAuth, sin claves de
  API, sin acceso para partners.
- **Clientes reverse-engineered de Firestore rotos.** En mayo de 2026,
  Stronger By Science activó Firebase App Check, así que todo cliente de
  terceros que hablaba directamente con Firestore ahora recibe `401`
  (`benthecarman/macro-factor-rs` y `sjawhar/macrofactor` — este último
  archivado por su autor con esa explicación).
- **El patrón "bridge con iOS Shortcuts" no resuelve la lectura.** El
  puente sanctioned de `chaotix345/macrofactor-mcp` automatiza las
  *escrituras* vía el action oficial `Log by JSON`, pero las *lecturas*
  siguen requiriendo que el usuario dispare la exportación manual
  (`More → Data Management → Data Export`) y suba el `.xlsx`/`.csv`. La
  variante que reintenta Firestore con un App Check token relayado desde
  el iPhone (`andreparmar/macrofactor-mcp-remote`) es especulativa,
  incompleta y probablemente inviable: App Attest solo puede emitir tokens
  desde la app oficial con el SDK de Firebase, no desde Shortcuts.
- **Apple Health como puente es insuficiente.** MacroFactor sincroniza
  calorías, macros, micros y peso hacia Apple Health / Health Connect,
  pero **no** el trend weight, el gasto adaptativo (TDEE) ni los datos de
  coaching — que son justo los valores centrales de este dashboard.

Mientras no exista una API oficial, el flujo manual de exportar → subir es
la única vía confiable. El foco está en reducir la fricción de ese flujo
(Ver issue #8 para el seguimiento).

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
