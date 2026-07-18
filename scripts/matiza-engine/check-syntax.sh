#!/usr/bin/env bash
set -u
cd "$(dirname "$0")"
failed=0
while IFS= read -r file; do
  if ! node --check "$file" >/dev/null 2>&1; then
    echo "Error de sintaxis: $file"
    node --check "$file"
    failed=1
  fi
done < <(find . -type f -name '*.js' -o -name '*.mjs' | sort)
if [ "$failed" -ne 0 ]; then
  exit 1
fi
echo "✓ Sintaxis JavaScript correcta."
