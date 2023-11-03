import { BaseDto } from './BaseDto';

export enum TaskRecurrenceEnum {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export interface RecurrenceDto extends BaseDto {
  type: TaskRecurrenceEnum;
  date: Date;
}
