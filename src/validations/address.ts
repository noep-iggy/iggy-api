import * as yup from 'yup';
import { validationGenerics } from './generics';
import { errorMessage } from '@/errors';
import { CreateAddressApi, UpdateAddressApi } from '@/types';

const create = yup
  .object<CreateAddressApi>()
  .shape({
    street: yup
      .string()
      .required(errorMessage.fields('street').REQUIRED)
      .typeError(errorMessage.fields('street').NOT_STRING),
    city: yup
      .string()
      .required(errorMessage.fields('city').REQUIRED)
      .typeError(errorMessage.fields('city').NOT_STRING),
    zipCode: yup
      .string()
      .required(errorMessage.fields('zipCode').REQUIRED)
      .typeError(errorMessage.fields('zipCode').NOT_STRING),
    country: yup
      .string()
      .required(errorMessage.fields('country').REQUIRED)
      .typeError(errorMessage.fields('country').NOT_STRING),
  })
  .concat(validationGenerics.optionalObject);

const update = yup
  .object<UpdateAddressApi>()
  .shape({
    street: yup
      .string()
      .required(errorMessage.fields('street').REQUIRED)
      .typeError(errorMessage.fields('street').NOT_STRING),
    city: yup
      .string()
      .required(errorMessage.fields('city').REQUIRED)
      .typeError(errorMessage.fields('city').NOT_STRING),
    zipCode: yup
      .string()
      .required(errorMessage.fields('zipCode').REQUIRED)
      .typeError(errorMessage.fields('zipCode').NOT_STRING),
    country: yup
      .string()
      .required(errorMessage.fields('country').REQUIRED)
      .typeError(errorMessage.fields('country').NOT_STRING),
  })
  .concat(validationGenerics.optionalObject);

export const validationAddress = {
  create: create,
  update: update,
};
