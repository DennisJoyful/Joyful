import dayjs from 'dayjs';

export function firstDay(d: Date | string) {
  return dayjs(d).startOf('month').toDate();
}
export function toMonthDateStr(iso: string) {
  const d = dayjs(iso);
  return d.startOf('month').format('YYYY-MM-DD');
}
export function addMonths(d: Date | string, m: number) {
  return dayjs(d).add(m, 'month').toDate();
}
