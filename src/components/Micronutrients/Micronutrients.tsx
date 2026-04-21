import type { DailyEntry } from '../../types';
import styles from './Micronutrients.module.scss';

// Recommended Daily Values (FDA 2020 values)
const RDV: Record<string, { label: string; rdv: number; unit: string }> = {
  fiber: { label: 'Fibra', rdv: 28, unit: 'g' },
  sodium: { label: 'Sodio', rdv: 2300, unit: 'mg' },
  vitaminD: { label: 'Vitamina D', rdv: 20, unit: 'mcg' },
  calcium: { label: 'Calcio', rdv: 1300, unit: 'mg' },
  iron: { label: 'Hierro', rdv: 18, unit: 'mg' },
  potassium: { label: 'Potasio', rdv: 4700, unit: 'mg' },
  vitaminC: { label: 'Vitamina C', rdv: 90, unit: 'mg' },
  vitaminA: { label: 'Vitamina A', rdv: 900, unit: 'mcg' },
  saturatedFat: { label: 'Grasa saturada', rdv: 20, unit: 'g' },
  cholesterol: { label: 'Colesterol', rdv: 300, unit: 'mg' },
  sugar: { label: 'Azúcar', rdv: 50, unit: 'g' },
};

function getBarColor(pct: number, isLimitType: boolean): string {
  if (isLimitType) {
    // Lower is better (sodium, saturated fat, cholesterol, sugar)
    if (pct <= 60) return 'var(--color-success)';
    if (pct <= 90) return 'var(--color-warning)';
    return 'var(--color-danger)';
  }
  if (pct >= 100) return 'var(--color-success)';
  if (pct >= 60) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

const LIMIT_TYPES = new Set(['sodium', 'saturatedFat', 'cholesterol', 'sugar']);

interface Props {
  days: DailyEntry[];
}

export function Micronutrients({ days }: Props) {
  // Last 7 days average
  const recent = [...days].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  if (recent.length === 0) return null;

  const avg = (key: keyof DailyEntry): number => {
    const vals = recent.map(d => (d[key] as number) ?? 0);
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  };

  const entries = Object.entries(RDV).filter(([key]) => {
    const val = avg(key as keyof DailyEntry);
    return val > 0;
  });

  if (entries.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Micronutrientes (prom. 7 días)</h2>
      <div className={styles.grid}>
        {entries.map(([key, { label, rdv, unit }]) => {
          const val = avg(key as keyof DailyEntry);
          const pct = Math.min((val / rdv) * 100, 150);
          const isLimit = LIMIT_TYPES.has(key);
          const color = getBarColor(pct, isLimit);
          return (
            <div key={key} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardName}>{label}</span>
                <span className={styles.cardValues}>
                  {Math.round(val)} / {rdv} {unit}
                </span>
              </div>
              <div className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{ width: `${Math.min(pct, 100)}%`, background: color }}
                />
              </div>
              <div className={styles.pctLabel}>{Math.round(pct)}% del valor diario</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
