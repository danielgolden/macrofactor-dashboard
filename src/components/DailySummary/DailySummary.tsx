import type { DailyEntry } from '../../types';
import { getGoalStatus, getStreak } from '../../lib/calculations';
import styles from './DailySummary.module.scss';

interface Props {
  day: DailyEntry;
  allDays: DailyEntry[];
}

function ProgressCard({
  label,
  value,
  target,
  unit,
  higherIsBetter = false,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  higherIsBetter?: boolean;
}) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const met = higherIsBetter ? value >= target : value <= target;
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardValue}>
        {value.toLocaleString()}
        <span style={{ fontSize: '1rem', color: 'var(--color-text-tertiary)' }}> {unit}</span>
      </div>
      <div className={styles.cardSub}>
        Target: {target.toLocaleString()} {unit}{' '}
        <span className={met ? styles.met : styles.missed}>
          {met ? '✓' : '✗'}
        </span>
      </div>
      <div className={styles.progressBar}>
        <div
          className={`${styles.progressFill} ${met ? styles.met : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function DailySummary({ day, allDays }: Props) {
  const status = getGoalStatus(day);
  const streak = getStreak(allDays);
  const date = new Date(day.date + 'T00:00:00');
  const dateLabel = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
      </h2>
      <div className={styles.cards}>
        <ProgressCard
          label="Calorías"
          value={day.calories}
          target={day.targetCalories}
          unit="kcal"
        />
        <ProgressCard
          label="Proteína"
          value={day.protein}
          target={day.targetProtein}
          unit="g"
          higherIsBetter
        />
        <ProgressCard
          label="Grasa"
          value={day.fat}
          target={day.targetFat}
          unit="g"
        />
        <ProgressCard
          label="Carbohidratos"
          value={day.carbs}
          target={day.targetCarbs}
          unit="g"
        />
        <div className={styles.card}>
          <div className={styles.cardLabel}>Racha actual</div>
          <div className={styles.cardValue}>{streak}</div>
          <div className={styles.cardSub}>
            días cumpliendo ambos objetivos
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Hoy</div>
          <div className={`${styles.cardValue} ${status.bothMet ? styles.met : styles.missed}`}>
            {status.bothMet ? '✓ Meta' : '✗ Falta'}
          </div>
          <div className={styles.cardSub}>
            {status.caloriesMet ? '✓ Calorías' : '✗ Calorías'} &nbsp;
            {status.proteinMet ? '✓ Proteína' : '✗ Proteína'}
          </div>
        </div>
      </div>
    </section>
  );
}
