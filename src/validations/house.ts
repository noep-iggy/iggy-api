import { errorMessage } from '@/errors';
import { CreateHouseApi, UpdateHouseApi } from 'src/types';
import * as yup from 'yup';

const create: yup.ObjectSchema<CreateHouseApi> = yup.object({
  name: yup
    .string()
    .required(errorMessage.fields('name').REQUIRED)
    .typeError(errorMessage.fields('name').NOT_STRING),
});

const update: yup.ObjectSchema<UpdateHouseApi> = yup.object({
  name: yup
    .string()
    .min(1, errorMessage.fields('name').REQUIRED)
    .optional()
    .default(undefined),
  animalIds: yup
    .array()
    .of(yup.string().typeError(errorMessage.fields('animalIds').NOT_STRING))
    .optional()
    .default(undefined),
  userIds: yup
    .array()
    .of(yup.string().typeError(errorMessage.fields('userIds').NOT_STRING))
    .optional()
    .default(undefined),
});

export const houseValidation = {
  create,
  update,
};
