// providers/SQLiteProvider.tsx (New file for wrapping the app or relevant components)
import React, { createContext, useContext } from 'react';
import { SQLiteProvider as ExpoSQLiteProvider, useSQLiteContext as useExpoSQLiteContext , SQLiteDatabase} from 'expo-sqlite';
import { initDatabase, insertEvent, isTableEmpty } from '@/lib/database';
import { PRESET_TAGS } from '@/lib/constants';

const SQLiteContext = createContext<SQLiteDatabase | undefined>(undefined);

export const SQLiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const insertSampleData = async (db: SQLiteDatabase) => {
    if (await isTableEmpty(db)) {
      const sampleDateKey = '2025-11-12';
      const samples = [
        { title: PRESET_TAGS.STUDY.title, start: 600, duration: 45, colorClass: PRESET_TAGS.STUDY.colorClass },
        { title: PRESET_TAGS.FOCUS.title, start: 660, duration: 25, colorClass: PRESET_TAGS.FOCUS.colorClass },
        { title: PRESET_TAGS.WORK.title, start: 720, duration: 60, colorClass: PRESET_TAGS.WORK.colorClass },
        { title: PRESET_TAGS.READ.title, start: 780, duration: 25, colorClass: PRESET_TAGS.READ.colorClass },
        { title: PRESET_TAGS.FITNESS.title, start: 810, duration: 25, colorClass: PRESET_TAGS.FITNESS.colorClass },
      ];

      for (const event of samples) {
        await insertEvent(db, event.title, event.start, event.duration, event.colorClass, sampleDateKey);
      }
    }
  };

  return (
    <ExpoSQLiteProvider databaseName="calendar.db" onInit={async (db) => {
      await initDatabase(db);
      await insertSampleData(db);
    }}>
      {children}
    </ExpoSQLiteProvider>
  );
};

export const useSQLite = () => {
  const context = useExpoSQLiteContext();
  if (!context) {
    throw new Error('useSQLite must be used within a SQLiteProvider');
  }
  return context;
};