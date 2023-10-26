import { errorMessage } from '@/errors';
import { UpdateUserApi, AuthRegisterApi, AuthLoginApi } from '@/types';
import { validationGenerics } from './generics';
import * as yup from 'yup';

const update: yup.ObjectSchema<UpdateUserApi> = yup.object({
  email: validationGenerics.email
    .min(1, errorMessage.fields('email').REQUIRED)
    .optional()
    .default(undefined),
  firstName: yup
    .string()
    .min(1, errorMessage.fields('firstName').REQUIRED)
    .optional()
    .default(undefined),
  lastName: yup
    .string()
    .min(1, errorMessage.fields('lastName').REQUIRED)
    .optional()
    .default(undefined),
  profilePicture: yup
    .string()
    .min(1, errorMessage.fields('profilePicture').REQUIRED)
    .optional()
    .default(undefined),
  address: yup
    .object({
      street: yup.string().optional().default(undefined),
      city: yup.string().optional().default(undefined),
      zipCode: yup.string().optional().default(undefined),
      country: yup.string().optional().default(undefined),
    })
    .optional()
    .default(undefined),
});

const create: yup.ObjectSchema<AuthRegisterApi> = yup.object({
  email: validationGenerics.email.required(
    errorMessage.fields('email').REQUIRED,
  ),
  password: validationGenerics.password,
  lastName: yup
    .string()
    .required(errorMessage.fields('lastName').REQUIRED)
    .typeError(errorMessage.fields('lastName').NOT_STRING),
  firstName: yup
    .string()
    .required(errorMessage.fields('firstName').REQUIRED)
    .typeError(errorMessage.fields('firstName').NOT_STRING),
  address: yup
    .object({
      street: yup.string().optional().default(undefined),
      city: yup.string().optional().default(undefined),
      zipCode: yup.string().optional().default(undefined),
      country: yup.string().optional().default(undefined),
    })
    .optional()
    .default(undefined),
});

const login = yup.object<AuthLoginApi>().shape({
  email: validationGenerics.email.required(
    errorMessage.fields('email').REQUIRED,
  ),
  password: validationGenerics.password,
});

export const validationUser = {
  update,
  login,
  create,
};
