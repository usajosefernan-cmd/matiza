import crypto from 'node:crypto';
import { normalizeText } from './text-utils.js';

export function uid(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

export function slugify(value) {
  return normalizeText(value).replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || uid('pieza');
}

export function tableColumns(db, table) {
  return new Set(db.prepare(`PRAGMA table_info(${table})`).all().map(row => row.name));
}

export function insertFlexible(db, table, object, { replace = false } = {}) {
  const columns = tableColumns(db, table);
  const entries = Object.entries(object).filter(([key, value]) => columns.has(key) && value !== undefined);
  if (!entries.length) throw new Error(`No hay columnas compatibles para insertar en ${table}.`);
  const names = entries.map(([key]) => key);
  const values = entries.map(([, value]) => value);
  const placeholders = names.map(() => '?').join(', ');
  const verb = replace ? 'INSERT OR REPLACE' : 'INSERT';
  return db.prepare(`${verb} INTO ${table} (${names.join(', ')}) VALUES (${placeholders})`).run(...values);
}

export function updateFlexible(db, table, object, whereSql, whereValues = []) {
  const columns = tableColumns(db, table);
  const entries = Object.entries(object).filter(([key, value]) => columns.has(key) && value !== undefined);
  if (!entries.length) return null;
  const setSql = entries.map(([key]) => `${key} = ?`).join(', ');
  return db.prepare(`UPDATE ${table} SET ${setSql} WHERE ${whereSql}`).run(...entries.map(([, value]) => value), ...whereValues);
}
