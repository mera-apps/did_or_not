import { formatInTimeZone } from 'date-fns-tz';
import { format } from 'date-fns';

export const TZ = 'Asia/Kolkata';

/** Today's date in IST as yyyy-MM-dd (independent of the browser's timezone). */
export const todayIST = () => formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd');

/** True from 11:00 PM IST to midnight IST (answers locked, awaiting finalization). */
export const isAfterCutoffIST = () => Number(formatInTimeZone(new Date(), TZ, 'H')) >= 23;

export const prettyDate = (ymd: string) => format(new Date(ymd + 'T00:00:00'), 'EEEE, d MMMM yyyy');
export const shortDate = (ymd: string) => format(new Date(ymd + 'T00:00:00'), 'd MMM yyyy');

export const addDays = (ymd: string, n: number) => {
  const d = new Date(ymd + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const weekday = (ymd: string) => new Date(ymd + 'T00:00:00Z').getUTCDay();
export const daysInYear = (y: number) => ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 366 : 365);
