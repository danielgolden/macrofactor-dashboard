# Plan: Categorización de alimentos con Open Food Facts

## Context
El usuario quiere poder filtrar la tabla de alimentos por categoría (salsas, postres, lácteos, etc.) usando Open Food Facts como fuente de categorías. La app es un SPA sin backend — todo ocurre en el browser y se cachea en localStorage.

**Advertencia de calidad:** OFF es una base de datos de productos con barcode. El search por texto funciona pero puede fallar para comidas caseras o marcas pequeñas. Los que no matcheen quedan como "Sin categoría".

---

## Archivos a crear/modificar

### Nuevo: `src/lib/offCategories.ts`

```
CACHE_KEY = 'mf_category_cache'
CategoryCache = Record<foodName, string | null>

fetchCategories(foodNames[], onProgress) → Promise<CategoryCache>
  - Lee cache existente de localStorage
  - Solo hace fetch de names no cacheados
  - GET https://world.openfoodfacts.org/cgi/search.pl?search_terms={name}&json=1&page_size=1
  - Extrae la primera categoría reconocible de categories_tags[]
  - Guarda al cache tras cada fetch (tolerante a interrupciones)
  - 150ms de delay entre requests

loadCategoryCache() → CategoryCache
clearCategoryCache() → void
```

Mapa de categorías OFF → español (tags tienen forma `"en:sauces"`):
```
sauces / condiment            → Salsas
dessert / sweet / candy       → Postres
dairy / milk / cream / cheese → Lácteos
meat / poultry                → Carnes
fish / seafood                → Pescados
snack / chip / cracker        → Snacks
fruit                         → Frutas
vegetable                     → Verduras
beverage / drink / juice      → Bebidas
bread / cereal / grain / pasta / waffle / pancake → Carbohidratos
egg                           → Huevos
```

### Modificado: `src/types/index.ts`
Agregar al final:
```typescript
export type CategoryCache = Record<string, string | null>;
```

### Modificado: `src/components/FoodDensity/FoodDensity.tsx`

**Nuevo estado:**
```typescript
const [categoryCache, setCategoryCache] = useState<CategoryCache>(() => loadCategoryCache());
const [fetching, setFetching] = useState(false);
const [fetchProgress, setFetchProgress] = useState({ done: 0, total: 0 });
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
```

**Botón "Categorizar":**
- Visible siempre en el header junto al buscador
- Label: "Categorizar alimentos" (primera vez) o "Actualizar categorías" (si ya hay cache)
- Durante fetch: deshabilitado, muestra "Categorizando X/Y…"
- Al terminar: `setCategoryCache(result)` → chips aparecen

**Chips de categoría** (bajo el header, sobre la tabla):
- `[Todas] [Salsas] [Postres] [Lácteos] … [Sin categoría]`
- Solo muestra categorías que tienen al menos 1 alimento en la tabla actual
- Click en chip activo → deselecciona (vuelve a "Todas")

**Filtrado adicional en `allEntries`:**
```typescript
.filter(e => {
  if (!selectedCategory) return true;
  if (selectedCategory === 'Sin categoría') return categoryCache[e.foodName] == null;
  return categoryCache[e.foodName] === selectedCategory;
})
```

### Modificado: `src/components/FoodDensity/FoodDensity.module.scss`
- `.categorizeBtn` — botón outline en el header
- `.categoryBar` — fila de chips (flex, gap, margin-bottom)
- `.chip` — pill con border-radius, padding, cursor pointer
- `.chip.active` — fondo `--color-accent`, texto blanco
- `.progressWrap` — barra de progreso con porcentaje

---

## Verificación
1. Primera vez: click "Categorizar alimentos" → progreso visible → chips aparecen
2. Click chip "Salsas" → tabla muestra solo salsas (Asian Zing, etc.)
3. Click "Sin categoría" → muestra alimentos no reconocidos
4. Recargar página → categorías persisten del cache, chips disponibles sin re-fetch
5. Click chip activo de nuevo → deselecciona, vuelve a mostrar todo
