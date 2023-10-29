import { BaseDto } from './BaseDto';
import { MediaDto } from './Media';

export enum TaskStatusEnum {
  TODO = 'TODO',
  REJECTED = 'REJECTED',
  DONE = 'DONE',
}

export enum TaskRecurrenceEnum {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export interface TaskDto extends BaseDto {
  title: string;
  description?: string;
  status: TaskStatusEnum;
  message?: string;
  recurrence?: TaskRecurrenceEnum;
  date: Date;
  users: string[];
  animals: string[];
  picture?: MediaDto;
}
