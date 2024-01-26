import { TaskPeriodEnum, TaskSearchParams } from '@/types';
import { Between } from 'typeorm';

export const getDateConditions = (searchParams: TaskSearchParams) => {
  if (!searchParams.date) {
    return {};
  }

  const startOfDay = (date: Date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const endOfDay = (date: Date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  };

  switch (searchParams.date) {
    case TaskPeriodEnum.YESTERDAY:
      const yesterdayStart = startOfDay(new Date());
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const yesterdayEnd = endOfDay(new Date(yesterdayStart));
      return { date: Between(yesterdayStart, yesterdayEnd) };

    case TaskPeriodEnum.TODAY:
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());
      return { date: Between(todayStart, todayEnd) };

    case TaskPeriodEnum.TOMORROW:
      const tomorrowStart = startOfDay(new Date());
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      const tomorrowEnd = endOfDay(new Date(tomorrowStart));
      return { date: Between(tomorrowStart, tomorrowEnd) };

    case TaskPeriodEnum.WEEK:
      const startOfWeek = startOfDay(new Date());
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = endOfDay(new Date());
      endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
      return { date: Between(startOfWeek, endOfWeek) };

    case TaskPeriodEnum.MONTH:
      const startOfMonth = startOfDay(new Date());
      startOfMonth.setDate(1);
      const endOfMonth = endOfDay(new Date(startOfMonth));
      endOfMonth.setMonth(startOfMonth.getMonth() + 1);
      endOfMonth.setDate(endOfMonth.getDate() - 1);
      return { date: Between(startOfMonth, endOfMonth) };

    default:
      return {};
  }
};
