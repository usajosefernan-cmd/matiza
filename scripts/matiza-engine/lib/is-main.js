import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function isMainModule(importMetaUrl) {
  if (!process.argv[1]) return false;
  try {
    return path.resolve(fileURLToPath(importMetaUrl)) === path.resolve(process.argv[1]);
  } catch {
    return false;
  }
}
