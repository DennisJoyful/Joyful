import dayjs from 'dayjs';

export function addDays(date: string | Date, days: number) {
  return dayjs(date).add(days, 'day').toDate();
}
