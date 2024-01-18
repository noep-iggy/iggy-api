import { AnimalDto } from './Animal';
import { BaseDto } from './BaseDto';
import { MediaDto } from './Media';
import { RecurrenceDto } from './Recurrence';
import { UserDto } from './User';

export enum TaskStatusEnum {
  TODO = 'TODO',
  TO_VALIDATE = 'TO_VALIDATE',
  DONE = 'DONE',
}

export interface TaskDto extends BaseDto {
  title: string;
  description?: string;
  status: TaskStatusEnum;
  message?: string;
  recurrence?: RecurrenceDto;
  date: Date;
  users: UserDto[];
  animals: AnimalDto[];
  picture?: MediaDto;
  isArchived: boolean;
}
