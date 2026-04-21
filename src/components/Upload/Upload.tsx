import { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { parseXlsx } from '../../lib/parseXlsx';
import { saveData } from '../../lib/storage';
import type { MacroFactorData } from '../../types';
import styles from './Upload.module.scss';

interface Props {
  onDataLoaded: (data: MacroFactorData) => void;
}

export function Upload({ onDataLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith('.xlsx')) {
      setError('Solo se aceptan archivos .xlsx');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await parseXlsx(file);
      saveData(data);
      onDataLoaded(data);
    } catch (err) {
      setError('Error al parsear el archivo. Asegúrate de que sea un export de MacroFactor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>MacroFactor Dashboard</h1>
      <p className={styles.subtitle}>Sube tu export .xlsx para ver tu progreso</p>

      <div
        className={`${styles.dropzone} ${dragging ? styles.active : ''} ${error ? styles.error : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload .xlsx file"
      >
        <div className={styles.icon}>📊</div>
        <p className={styles.dropLabel}>Arrastra tu archivo aquí o haz clic para elegirlo</p>
        <p className={styles.dropHint}>.xlsx de MacroFactor</p>

        {loading && <p className={styles.loading}>Procesando archivo…</p>}
        {error && <p className={styles.errorMsg}>{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className={styles.hiddenInput}
        onChange={onInputChange}
      />
    </div>
  );
}
