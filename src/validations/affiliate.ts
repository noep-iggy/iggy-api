import { errorMessage } from '@/errors';
import {
  AnimalTypeEnum,
  CreateAffiliateApi,
  UpdateAffiliateApi,
} from 'src/types';
import * as yup from 'yup';

const create: yup.ObjectSchema<CreateAffiliateApi> = yup.object({
  title: yup
    .string()
    .min(1, errorMessage.fields('title').REQUIRED)
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('title').NOT_STRING),
  description: yup
    .string()
    .min(1, errorMessage.fields('description').REQUIRED)
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('description').NOT_STRING),
  url: yup
    .string()
    .url(errorMessage.fields('url').NOT_URL)
    .required(errorMessage.fields('url').REQUIRED)
    .typeError(errorMessage.fields('url').NOT_STRING),
  code: yup
    .string()
    .required(errorMessage.fields('code').REQUIRED)
    .typeError(errorMessage.fields('code').NOT_STRING),
  animals: yup
    .array()
    .of(
      yup
        .string<AnimalTypeEnum>()
        .oneOf(
          Object.values(AnimalTypeEnum),
          errorMessage.fields('animals').NOT_VALID,
        )
        .required(errorMessage.fields('animals').REQUIRED),
    )
    .required(errorMessage.fields('animals').REQUIRED),
});

const update: yup.ObjectSchema<UpdateAffiliateApi> = yup.object({
  title: yup
    .string()
    .min(1, errorMessage.fields('title').REQUIRED)
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('title').NOT_STRING),
  description: yup
    .string()
    .min(1, errorMessage.fields('description').REQUIRED)
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('description').NOT_STRING),
  url: yup
    .string()
    .url(errorMessage.fields('url').NOT_URL)
    .min(1, errorMessage.fields('url').REQUIRED)
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('url').NOT_STRING),
  code: yup
    .string()
    .min(1, errorMessage.fields('code').REQUIRED)
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('code').NOT_STRING),
  animals: yup
    .array()
    .of(
      yup
        .string<AnimalTypeEnum>()
        .oneOf(
          Object.values(AnimalTypeEnum),
          errorMessage.fields('animals').NOT_VALID,
        ),
    )
    .optional()
    .default(undefined),
});

export const affiliateValidation = {
  create,
  update,
};
