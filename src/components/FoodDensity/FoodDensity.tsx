import { useState } from 'react';
import type { FoodEntry } from '../../types';
import { getFoodDensity } from '../../lib/calculations';
import styles from './FoodDensity.module.scss';

type SortKey = 'timesLogged' | 'caloricDensity' | 'avgCaloriesPerServing';

const SORT_LABELS: Record<SortKey, string> = {
  timesLogged: 'Frecuencia',
  caloricDensity: 'kcal/g',
  avgCaloriesPerServing: 'kcal/porción',
};

interface Props {
  foodLog: FoodEntry[];
}

export function FoodDensity({ foodLog }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('timesLogged');
  const [showAll, setShowAll] = useState(false);

  const allEntries = getFoodDensity(foodLog).sort((a, b) => b[sortKey] - a[sortKey]);
  const PAGE = 15;
  const entries = showAll ? allEntries : allEntries.slice(0, PAGE);

  if (allEntries.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Alimentos más consumidos</h2>
        <div className={styles.sortControls}>
          Ordenar:
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <button
              key={k}
              className={`${styles.sortBtn} ${sortKey === k ? styles.active : ''}`}
              onClick={() => setSortKey(k)}
            >
              {SORT_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Alimento</th>
              <th className={styles.th} onClick={() => setSortKey('timesLogged')}>Veces</th>
              <th className={styles.th} onClick={() => setSortKey('avgCaloriesPerServing')}>Prom. kcal</th>
              <th className={styles.th} onClick={() => setSortKey('caloricDensity')}>kcal/g</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.foodName}>
                <td className={`${styles.td} ${styles.foodName}`} title={entry.foodName}>
                  {entry.foodName}
                </td>
                <td className={styles.td}>{entry.timesLogged}</td>
                <td className={styles.td}>{entry.avgCaloriesPerServing}</td>
                <td className={styles.td}>
                  <span className={styles.densityBadge}>{entry.caloricDensity}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!showAll && allEntries.length > PAGE && (
          <button className={styles.showMoreBtn} onClick={() => setShowAll(true)}>
            Ver todos los {allEntries.length} alimentos
          </button>
        )}
      </div>
    </section>
  );
}
