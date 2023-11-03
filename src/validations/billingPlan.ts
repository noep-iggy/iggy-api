import { errorMessage } from '@/errors';
import {
  BillingPlanTypeEnum,
  CreateBillingPlanApi,
  UpdateBillingPlanApi,
} from 'src/types';
import * as yup from 'yup';

const create: yup.ObjectSchema<CreateBillingPlanApi> = yup.object({
  title: yup
    .string()
    .required(errorMessage.fields('title').REQUIRED)
    .typeError(errorMessage.fields('title').NOT_STRING),
  description: yup
    .string()
    .required(errorMessage.fields('description').REQUIRED)
    .typeError(errorMessage.fields('description').NOT_STRING),
  price: yup
    .number()
    .min(0, errorMessage.fields('price').NOT_VALID)
    .required(errorMessage.fields('price').REQUIRED)
    .typeError(errorMessage.fields('price').NOT_NUMBER),
  type: yup
    .string<BillingPlanTypeEnum>()
    .oneOf(
      Object.values(BillingPlanTypeEnum),
      errorMessage.fields('type').NOT_VALID,
    )
    .required(errorMessage.fields('type').REQUIRED),
});

const update: yup.ObjectSchema<UpdateBillingPlanApi> = yup.object({
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
  price: yup
    .number()
    .min(0, errorMessage.fields('price').NOT_VALID)
    .optional()
    .default(undefined)
    .typeError(errorMessage.fields('price').NOT_NUMBER),
  type: yup
    .string<BillingPlanTypeEnum>()
    .oneOf(
      Object.values(BillingPlanTypeEnum),
      errorMessage.fields('type').NOT_VALID,
    )
    .optional()
    .default(undefined),
});

export const billingPlanValidation = {
  create,
  update,
};
