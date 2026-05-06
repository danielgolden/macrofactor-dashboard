# CLAUDE.md — Instrucciones para Claude Code

Este es un proyecto Next.js 15 con Clerk (auth), Supabase (DB) y Stripe Projects.

## Lo que necesitas hacer

1. **Crear repo privado en GitHub**
   ```bash
   gh repo create macrofactor-explorer --private --source=. --remote=origin --push
   ```

2. **Conectar servicios con Stripe Projects**
   ```bash
   stripe plugin install projects
   stripe projects init macrofactor-explorer
   stripe projects add clerk/auth
   stripe projects add supabase/database
   stripe projects add vercel/project
   stripe projects env --pull
   ```

3. **Correr el migration en Supabase**
   - Abrir Supabase: `stripe projects open supabase`
   - Ir a SQL Editor
   - Pegar y ejecutar el contenido de `supabase/migration.sql`

4. **Verificar que la app corre localmente**
   ```bash
   npm install
   npm run dev
   ```

5. **Deploy a Vercel**
   - Vercel detecta el repo en GitHub automáticamente
   - O: `stripe projects open vercel` y conectar el repo

## Variables de entorno necesarias (.env.local)
Ver `.env.example` para la lista completa.
Stripe Projects las genera automáticamente con `stripe projects env --pull`.

## Notas importantes
- El middleware de Clerk protege todas las rutas excepto `/sign-in`
- La tabla `foods` usa RLS — cada usuario solo ve sus propios datos
- El import de datos va a `/api/import` (POST) con el JSON de MacroFactor procesado
