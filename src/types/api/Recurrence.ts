import { TaskRecurrenceEnum } from '../dto';

export interface CreateRecurrenceApi {
  type: TaskRecurrenceEnum;
  date: Date;
}

export interface UpdateRecurrenceApi {
  type?: TaskRecurrenceEnum;
  date?: Date;
}
