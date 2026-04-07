/**
 * Predefined frequency options with interval in hours
 */
export const FREQUENCY_PRESETS = [
  { value: '24', label: '1x/dia (24/24h)', hours: 24 },
  { value: '12', label: '2x/dia (12/12h)', hours: 12 },
  { value: '8', label: '3x/dia (8/8h)', hours: 8 },
  { value: '6', label: '4x/dia (6/6h)', hours: 6 },
  { value: '4', label: '6x/dia (4/4h)', hours: 4 },
  { value: 'custom', label: 'Personalizado', hours: 0 },
] as const;

/**
 * Calculate all scheduled times in a 24h period based on first dose and interval
 */
export function calculateScheduledTimes(firstDoseTime: string, intervalHours: number): string[] {
  if (!firstDoseTime || intervalHours <= 0 || intervalHours > 24) return [firstDoseTime].filter(Boolean);

  const [hours, minutes] = firstDoseTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return [];

  const times: string[] = [];
  const totalSlots = Math.floor(24 / intervalHours);

  for (let i = 0; i < totalSlots; i++) {
    const totalMinutes = (hours * 60 + minutes + i * intervalHours * 60) % (24 * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  }

  return times.sort();
}

/**
 * Parse frequency string to get interval hours
 * Supports formats: "8", "8/8h", "12/12h", "de 8 em 8 horas", etc.
 */
export function parseFrequencyToHours(frequency: string): number | null {
  if (!frequency) return null;
  
  // Direct number (from preset)
  const directNum = Number(frequency);
  if (!isNaN(directNum) && directNum > 0 && directNum <= 24) return directNum;

  // Pattern: "8/8h", "12/12h"
  const slashMatch = frequency.match(/(\d+)\/\d+h/i);
  if (slashMatch) return Number(slashMatch[1]);

  // Pattern: "de X em X"
  const deEmMatch = frequency.match(/de\s+(\d+)\s+em\s+(\d+)/i);
  if (deEmMatch) return Number(deEmMatch[1]);

  return null;
}

/**
 * Format frequency for display
 */
export function formatFrequencyLabel(frequency: string): string {
  const preset = FREQUENCY_PRESETS.find(p => p.value === frequency);
  if (preset) return preset.label;
  
  const hours = parseFrequencyToHours(frequency);
  if (hours) return `${Math.floor(24 / hours)}x/dia (${hours}/${hours}h)`;
  
  return frequency;
}
