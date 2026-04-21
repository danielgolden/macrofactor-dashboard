import { useState } from 'react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailyEntry } from '../../types';
import { aggregateByWeek, aggregateByMonth } from '../../lib/calculations';
import styles from './MacroChart.module.scss';

type Period = 'weekly' | 'monthly';
type Macro = 'calories' | 'protein' | 'fat' | 'carbs';

const MACRO_CONFIG: Record<
  Macro,
  { label: string; color: string; key: string; targetKey: string; unit: string }
> = {
  calories: {
    label: 'Calorías',
    color: '#e35050',
    key: 'avgCalories',
    targetKey: 'avgTargetCalories',
    unit: 'kcal',
  },
  protein: {
    label: 'Proteína',
    color: '#4c9be8',
    key: 'avgProtein',
    targetKey: 'avgTargetProtein',
    unit: 'g',
  },
  fat: {
    label: 'Grasa',
    color: '#f5a623',
    key: 'avgFat',
    targetKey: 'avgTargetFat',
    unit: 'g',
  },
  carbs: {
    label: 'Carbos',
    color: '#7ed07e',
    key: 'avgCarbs',
    targetKey: 'avgTargetCarbs',
    unit: 'g',
  },
};

interface Props {
  days: DailyEntry[];
}

export function MacroChart({ days }: Props) {
  const [period, setPeriod] = useState<Period>('weekly');
  const [macro, setMacro] = useState<Macro>('calories');

  const data = period === 'weekly' ? aggregateByWeek(days, 10) : aggregateByMonth(days, 6);
  const cfg = MACRO_CONFIG[macro];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tendencias</h2>
        <div className={styles.controls}>
          <button
            className={`${styles.toggleBtn} ${period === 'weekly' ? styles.active : ''}`}
            onClick={() => setPeriod('weekly')}
          >
            Semanal
          </button>
          <button
            className={`${styles.toggleBtn} ${period === 'monthly' ? styles.active : ''}`}
            onClick={() => setPeriod('monthly')}
          >
            Mensual
          </button>
        </div>
      </div>

      <div className={styles.macroTabs}>
        {(Object.keys(MACRO_CONFIG) as Macro[]).map((m) => (
          <button
            key={m}
            className={`${styles.macroTab} ${macro === m ? styles.active : ''}`}
            style={macro === m ? { color: MACRO_CONFIG[m].color } : {}}
            onClick={() => setMacro(m)}
          >
            {MACRO_CONFIG[m].label}
          </button>
        ))}
      </div>

      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-primary)" />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
              width={50}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-bg-surface-1)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
              }}
              formatter={(value) => [`${value} ${cfg.unit}`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
            <Bar
              dataKey={cfg.key}
              name={`Prom. ${cfg.label}`}
              fill={cfg.color}
              radius={[3, 3, 0, 0]}
              opacity={0.85}
            />
            <Line
              type="monotone"
              dataKey={cfg.targetKey}
              name={`Target ${cfg.label}`}
              stroke={cfg.color}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
