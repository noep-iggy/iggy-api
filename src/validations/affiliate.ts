import { errorMessage } from '@/errors';
import {
  AnimalTypeEnum,
  CreateAffiliateApi,
  UpdateAffiliateApi,
} from '@/types';

import * as yup from 'yup';

const create: yup.ObjectSchema<CreateAffiliateApi> = yup.object({
  title: yup
    .string()
    .required(errorMessage.fields('title').REQUIRED)
    .typeError(errorMessage.fields('title').NOT_STRING),
  description: yup
    .string()
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('description').NOT_STRING),
  url: yup
    .string()
    .url(errorMessage.fields('url').NOT_URL)
    .required(errorMessage.fields('url').REQUIRED)
    .typeError(errorMessage.fields('url').NOT_STRING),
  image: yup
    .string()
    .min(1, errorMessage.fields('image').REQUIRED)
    .optional()
    .default(undefined),
  brand: yup
    .string()
    .required(errorMessage.fields('brand').REQUIRED)
    .typeError(errorMessage.fields('brand').NOT_STRING),
  basePrice: yup
    .number()
    .min(0, errorMessage.fields('discountPrice').TOO_SHORT)
    .required(errorMessage.fields('basePrice').REQUIRED)
    .typeError(errorMessage.fields('basePrice').NOT_NUMBER),
  discountPrice: yup
    .number()
    .min(0, errorMessage.fields('discountPrice').TOO_SHORT)
    .required(errorMessage.fields('basePrice').REQUIRED)
    .typeError(errorMessage.fields('basePrice').NOT_NUMBER),
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
  image: yup
    .string()
    .min(1, errorMessage.fields('image').REQUIRED)
    .optional()
    .default(undefined),
  brand: yup
    .string()
    .min(1, errorMessage.fields('brand').REQUIRED)
    .optional()
    .default(undefined),
  basePrice: yup
    .number()
    .min(1, errorMessage.fields('basePrice').REQUIRED)
    .optional()
    .default(undefined),
  discountPrice: yup
    .number()
    .min(1, errorMessage.fields('discountPrice').REQUIRED)
    .optional()
    .default(undefined),
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
    .min(1, errorMessage.fields('animals').REQUIRED)
    .optional()
    .default(undefined),
});

export const affiliateValidation = {
  create,
  update,
};
