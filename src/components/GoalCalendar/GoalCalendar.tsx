import { useState } from 'react';
import type { DailyEntry } from '../../types';
import { getCalendarDays } from '../../lib/calculations';
import styles from './GoalCalendar.module.scss';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface Props {
  days: DailyEntry[];
}

export function GoalCalendar({ days }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const cells = getCalendarDays(days, year, month);
  const monthLabel = new Date(year, month, 1).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Cumplimiento de metas</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className={styles.navBtn} onClick={prev}>‹</button>
          <span className={styles.monthLabel}>
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          </span>
          <button className={styles.navBtn} onClick={next}>›</button>
        </div>
      </div>

      <div className={styles.calendar}>
        <div className={styles.weekdays}>
          {WEEKDAYS.map(d => (
            <div key={d} className={styles.weekday}>{d}</div>
          ))}
        </div>
        <div className={styles.grid}>
          {cells.map((cell, i) => {
            const day = cell.date ? new Date(cell.date + 'T00:00:00').getDate() : null;
            return (
              <div key={i} className={`${styles.cell} ${styles[cell.status]}`}>
                {day}
              </div>
            );
          })}
        </div>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--color-success-subtle)', border: '1.5px solid var(--color-success)' }} />
            Ambas metas
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--color-warning-subtle)', border: '1.5px solid var(--color-warning)' }} />
            Una meta
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--color-danger-subtle)', border: '1.5px solid var(--color-danger)' }} />
            Sin meta
          </div>
        </div>
      </div>
    </section>
  );
}
