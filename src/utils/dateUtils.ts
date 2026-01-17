import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Returns the year as-is (standard Gregorian calendar).
 * Previously converted to Holocene Era (+10,000), now just passes through.
 */
export const toHE = (year: number): number => {
    return year;
};

/**
 * Formats a date string with the year.
 * Example: 2026-01-16 -> 16 jan 2026
 */
export const formatHEDate = (dateStr: string | Date, formatStr: string = 'd MMM'): string => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const year = date.getFullYear();

    const partialDate = format(date, formatStr, { locale: fr });
    return `${partialDate} ${year}`;
};

/**
 * Gets the current year.
 */
export const getCurrentHEYear = (): number => {
    return new Date().getFullYear();
};
