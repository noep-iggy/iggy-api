import { TaskRecurrenceEnum, TaskStatusEnum } from '../dto';

export interface CreateTaskApi {
  title: string;
  description?: string;
  recurrence?: TaskRecurrenceEnum;
  date: Date;
  userIds: string[];
  animalIds: string[];
}

export interface UpdateTaskApi {
  title?: string;
  description?: string;
  status?: TaskStatusEnum;
  message?: string;
  recurrence?: TaskRecurrenceEnum;
  date?: Date;
  userIds?: string[];
  animalIds?: string[];
  picture?: string;
}
