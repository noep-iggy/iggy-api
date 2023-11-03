import { BaseDto } from './BaseDto';
import { MediaDto } from './Media';
import { RecurrenceDto } from './Recurrence';

export enum TaskStatusEnum {
  TODO = 'TODO',
  TO_VALIDATE = 'TO_VALIDATE',
  DONE = 'DONE',
  ARCHIVED = 'ARCHIVED',
}

export interface TaskDto extends BaseDto {
  title: string;
  description?: string;
  status: TaskStatusEnum;
  message?: string;
  recurrence?: RecurrenceDto;
  date: Date;
  users: string[];
  animals: string[];
  picture?: MediaDto;
}
