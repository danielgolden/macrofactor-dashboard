# MacroFactor Explorer

Visualizador personal de densidad calórica — Next.js + Clerk + Supabase.

## Stack

- **Next.js 15** (App Router)
- **Clerk** — autenticación con Google o con username (sin email)
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

## Autenticación sin email

La app permite crear cuenta **sin dar un correo electrónico**: username +
password, o un click con Google. El código ya expone `/sign-in` y `/sign-up`,
pero *qué identificadores acepta Clerk se configura en el Dashboard*, no en el
repo. Sin este paso el formulario de registro seguirá pidiendo email.

En [dashboard.clerk.com](https://dashboard.clerk.com) → tu aplicación →
**Configure → User & authentication**:

1. **Email, phone, username**
   - Activar **Username** (`Required`).
   - **Email address** → `Off`, o `Optional` si quieres permitir (no exigir)
     recuperación de cuenta por correo.
   - Al menos un identificador es obligatorio, así que activa Username *antes*
     de apagar Email; si no, el Dashboard rechaza el cambio.
2. **Authentication strategies** → activar **Password** (y opcionalmente
   **Passkey**), que es lo que sustituye al email code / magic link.
3. **Social connections** → dejar **Google** activo. Ojo: Google entrega el
   email de la cuenta igualmente; es una opción de conveniencia, no la vía
   anónima. La vía sin email es username + password.

Consideraciones antes de apagar el email por completo:

- **No hay recuperación de cuenta.** Sin email ni teléfono, un usuario que
  olvide su password pierde el acceso, y con él sus datos importados. La única
  salida es resetear el password desde el Dashboard de Clerk.
- **El flujo combinado sign-in-or-up no soporta username** (Clerk necesita un
  medio de contacto para verificar). Por eso `/sign-in` y `/sign-up` son
  páginas separadas y enlazadas entre sí vía `signUpUrl` / `signInUrl`.
- La app no depende del email en ningún punto: el aislamiento de datos usa el
  `userId` de Clerk (ver RLS en `supabase/migration.sql`), y la barra lateral
  cae a `@username` cuando no hay correo.

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
