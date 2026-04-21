import { useState } from 'react';
import { loadData, clearData } from './lib/storage';
import { getMostRecentDay } from './lib/calculations';
import type { MacroFactorData } from './types';
import { Upload } from './components/Upload/Upload';
import { DailySummary } from './components/DailySummary/DailySummary';
import { MacroChart } from './components/MacroChart/MacroChart';
import { GoalCalendar } from './components/GoalCalendar/GoalCalendar';
import { FoodDensity } from './components/FoodDensity/FoodDensity';
import { Micronutrients } from './components/Micronutrients/Micronutrients';
import appStyles from './App.module.scss';

function App() {
  const [data, setData] = useState<MacroFactorData | null>(() => loadData());

  const mostRecent = data ? getMostRecentDay(data.dailySummary) : null;

  if (!data) {
    return <Upload onDataLoaded={setData} />;
  }

  return (
    <div className={appStyles.app}>
      <header className={appStyles.header}>
        <h1 className={appStyles.logo}>MacroFactor Dashboard</h1>
        <div className={appStyles.headerRight}>
          <span className={appStyles.uploadedAt}>
            {data.dailySummary.length} días registrados
          </span>
          <button
            className={appStyles.reuploadBtn}
            onClick={() => {
              clearData();
              setData(null);
            }}
          >
            Cambiar archivo
          </button>
        </div>
      </header>

      <main className={appStyles.main}>
        {mostRecent && (
          <DailySummary day={mostRecent} allDays={data.dailySummary} />
        )}
        <MacroChart days={data.dailySummary} />
        <GoalCalendar days={data.dailySummary} />
        {data.foodLog.length > 0 && <FoodDensity foodLog={data.foodLog} />}
        <Micronutrients days={data.dailySummary} />
      </main>
    </div>
  );
}

export default App;
