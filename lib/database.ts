// lib/database.ts
import * as SQLite from 'expo-sqlite'; // Use /next for async APIs

export const initDatabase = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      start INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      colorClass TEXT NOT NULL,
      dateKey TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_dateKey ON events(dateKey);
  `);
  console.log('Database initialized');
};

export const insertEvent = async (
  db: SQLite.SQLiteDatabase,
  title: string,
  start: number,
  duration: number,
  colorClass: string,
  dateKey: string
) => {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO events (title, start, duration, colorClass, dateKey) VALUES (?, ?, ?, ?, ?);`,
      [title, start, duration, colorClass, dateKey]
    );
  });
  console.log('Event inserted');
};

export const getEventsForDate = async (db: SQLite.SQLiteDatabase, dateKey: string) => {
  return await db.getAllAsync(
    `SELECT * FROM events WHERE dateKey = ? ORDER BY start;`,
    [dateKey]
  );
};

export const deleteEvent = async (db: SQLite.SQLiteDatabase, id: number) => {
  await db.runAsync(`DELETE FROM events WHERE id = ?;`, [id]);
  console.log('Event deleted');
};

export const isTableEmpty = async (db: SQLite.SQLiteDatabase) => {
  const result = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM events;`);
  return result?.count === 0;
};