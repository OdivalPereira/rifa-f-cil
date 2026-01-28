
export interface SoldNumber {
  number: number;
  confirmed_at: string | null;
}

/**
 * Parses CSV response from Supabase for sold numbers.
 * Expected format: number,confirmed_at
 *
 * Optimized for performance by avoiding regex and minimal object allocation.
 */
export function parseSoldNumbersCSV(csvText: string): SoldNumber[] {
  if (!csvText) return [];

  const lines = csvText.split('\n');
  const result: SoldNumber[] = [];

  // Start from index 1 to skip header "number,confirmed_at"
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]; // Don't trim to avoid allocation, check empty later
    if (!line || line.length === 0) continue;

    const commaIndex = line.indexOf(',');
    if (commaIndex === -1) continue;

    const numberStr = line.substring(0, commaIndex);
    let confirmedAtStr = line.substring(commaIndex + 1);

    // Remove potential carriage return if on Windows/mixed environment
    if (confirmedAtStr.endsWith('\r')) {
      confirmedAtStr = confirmedAtStr.slice(0, -1);
    }

    const num = parseInt(numberStr, 10);
    if (isNaN(num)) continue;

    let confirmed_at: string | null = confirmedAtStr;

    // Handle quotes
    if (confirmed_at.length >= 2 && confirmed_at.startsWith('"') && confirmed_at.endsWith('"')) {
      confirmed_at = confirmed_at.slice(1, -1);
    }

    if (confirmed_at === '' || confirmed_at === 'NULL') {
      confirmed_at = null;
    }

    result.push({ number: num, confirmed_at });
  }

  return result;
}
