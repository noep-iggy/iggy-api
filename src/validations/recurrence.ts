import { errorMessage } from '@/errors';
import {
  CreateRecurrenceApi,
  TaskRecurrenceEnum,
  UpdateRecurrenceApi,
} from 'src/types';
import * as yup from 'yup';

const create: yup.ObjectSchema<CreateRecurrenceApi> = yup.object({
  date: yup
    .date()
    .required(errorMessage.fields('date').REQUIRED)
    .typeError(errorMessage.fields('date').NOT_VALID),
  type: yup
    .string<TaskRecurrenceEnum>()
    .oneOf(
      Object.values(TaskRecurrenceEnum),
      errorMessage.fields('type').NOT_VALID,
    )
    .required(errorMessage.fields('type').REQUIRED),
});

const update: yup.ObjectSchema<UpdateRecurrenceApi> = yup.object({
  date: yup
    .date()
    .min(1, errorMessage.fields('date').REQUIRED)
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('date').NOT_VALID),
  type: yup
    .mixed<TaskRecurrenceEnum>()
    .oneOf(
      Object.values(TaskRecurrenceEnum),
      errorMessage.fields('type').NOT_VALID,
    )
    .optional()
    .default(undefined),
});

export const recurrenceValidation = {
  create,
  update,
};
