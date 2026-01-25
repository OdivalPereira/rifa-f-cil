import type { Tables } from '@/integrations/supabase/types';

type RaffleNumber = Tables<'raffle_numbers'>;
type SoldNumber = Pick<RaffleNumber, 'number' | 'confirmed_at'>;

/**
 * Parses the CSV response from Supabase for sold numbers.
 * Expected format: number,confirmed_at
 *
 * This avoids the overhead of JSON parsing for large datasets.
 */
export function parseSoldNumbersCSV(csvText: string): SoldNumber[] {
  if (!csvText) return [];

  const lines = csvText.split('\n');
  if (lines.length < 2) return []; // Header only or empty

  const result: SoldNumber[] = [];

  // Skip header (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Format: number,confirmed_at
    const commaIndex = line.indexOf(',');
    if (commaIndex === -1) continue;

    const numberStr = line.substring(0, commaIndex);
    let confirmedAtStr = line.substring(commaIndex + 1);

    // Handle potential quotes
    if (confirmedAtStr.startsWith('"') && confirmedAtStr.endsWith('"')) {
      confirmedAtStr = confirmedAtStr.slice(1, -1);
    }

    // number is integer
    const number = parseInt(numberStr, 10);
    if (isNaN(number)) continue;

    // confirmed_at is null if empty string
    const confirmed_at = confirmedAtStr === '' ? null : confirmedAtStr;

    result.push({
      number,
      confirmed_at
    });
  }

  return result;
}
