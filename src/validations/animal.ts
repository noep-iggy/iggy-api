import { errorMessage } from '@/errors';
import {
  AnimalGenderEnum,
  AnimalStatusEnum,
  AnimalTypeEnum,
  CreateAnimalApi,
  UpdateAnimalApi,
} from 'src/types';
import * as yup from 'yup';

const create: yup.ObjectSchema<CreateAnimalApi> = yup.object({
  name: yup
    .string()
    .required(errorMessage.fields('name').REQUIRED)
    .typeError(errorMessage.fields('name').NOT_STRING),
  bornDate: yup.date().required(errorMessage.fields('bornDate').REQUIRED),
  gender: yup
    .mixed<AnimalGenderEnum>()
    .oneOf(
      Object.values(AnimalGenderEnum),
      errorMessage.fields('gender').NOT_VALID,
    )
    .required(errorMessage.fields('gender').REQUIRED)
    .typeError(errorMessage.fields('gender').NOT_STRING),
  type: yup
    .mixed<AnimalTypeEnum>()
    .oneOf(Object.values(AnimalTypeEnum), errorMessage.fields('type').NOT_VALID)
    .required(errorMessage.fields('type').REQUIRED)
    .typeError(errorMessage.fields('type').NOT_STRING),
});

const update: yup.ObjectSchema<UpdateAnimalApi> = yup.object({
  name: yup
    .string()
    .min(1, errorMessage.fields('name').REQUIRED)
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('name').NOT_STRING),
  bornDate: yup
    .date()
    .min(1, errorMessage.fields('bornDate').REQUIRED)
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('bornDate').NOT_STRING),
  gender: yup
    .mixed<AnimalGenderEnum>()
    .oneOf(
      Object.values(AnimalGenderEnum),
      errorMessage.fields('gender').NOT_VALID,
    )
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('gender').NOT_STRING),
  type: yup
    .mixed<AnimalTypeEnum>()
    .oneOf(Object.values(AnimalTypeEnum), errorMessage.fields('type').NOT_VALID)
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('type').NOT_STRING),
  status: yup
    .mixed<AnimalStatusEnum>()
    .oneOf(
      Object.values(AnimalStatusEnum),
      errorMessage.fields('status').NOT_VALID,
    )
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('status').NOT_STRING),
});

export const animalValidation = {
  create,
  update,
};
