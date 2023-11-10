import { errorMessage } from '@/errors';
import {
  UpdateUserApi,
  AuthLoginApi,
  UserRoleEnum,
  RegisterApi,
  JoinApi,
} from '@/types';
import { genericsValidation } from './generics';
import * as yup from 'yup';
import { houseValidation } from './house';

const update: yup.ObjectSchema<UpdateUserApi> = yup.object({
  email: genericsValidation.email
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
  role: yup
    .mixed<UserRoleEnum>()
    .oneOf(Object.values(UserRoleEnum), errorMessage.fields('role').NOT_VALID)
    .optional()
    .default(undefined),
  house: houseValidation.update.optional().default(undefined),
});

const create: yup.ObjectSchema<RegisterApi> = yup.object({
  email: genericsValidation.email.required(
    errorMessage.fields('email').REQUIRED,
  ),
  password: genericsValidation.password.required(
    errorMessage.fields('password').REQUIRED),
  lastName: yup
    .string()
    .required(errorMessage.fields('lastName').REQUIRED)
    .typeError(errorMessage.fields('lastName').NOT_STRING),
  firstName: yup
    .string()
    .required(errorMessage.fields('firstName').REQUIRED)
    .typeError(errorMessage.fields('firstName').NOT_STRING),
});

const joinChild = yup.object<JoinApi>().shape({
  firstName: yup
    .string()
    .required(errorMessage.fields('firstName').REQUIRED)
    .typeError(errorMessage.fields('firstName').NOT_STRING),
});

const joinParent = yup.object<JoinApi>().shape({
  firstName: yup
    .string()
    .required(errorMessage.fields('userName').REQUIRED)
    .typeError(errorMessage.fields('userName').NOT_STRING),
  lastName: yup
    .string()
    .required(errorMessage.fields('lastName').REQUIRED)
    .typeError(errorMessage.fields('lastName').NOT_STRING),
  password: genericsValidation.password.required(
    errorMessage.fields('password').REQUIRED,
  ),
  email: genericsValidation.email.required(
    errorMessage.fields('email').REQUIRED,
  ),
});

const login = yup.object<AuthLoginApi>().shape({
  email: yup
    .string()
    .required(errorMessage.fields('email').REQUIRED)
    .typeError(errorMessage.fields('email').NOT_STRING),
  password: genericsValidation.password.required(
    errorMessage.fields('password').REQUIRED,
  ),
});

export const userValidation = {
  update,
  login,
  create,
  joinParent,
  joinChild,
};
