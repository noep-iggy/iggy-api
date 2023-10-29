import { errorMessage } from '@/errors';
import {
  UpdateUserApi,
  AuthRegisterApi,
  AuthLoginApi,
  UserRoleEnum,
} from '@/types';
import { genericsValidation } from './generics';
import * as yup from 'yup';
import { houseValidation } from './house';

const update: yup.ObjectSchema<UpdateUserApi> = yup.object({
  email: genericsValidation.email
    .min(1, errorMessage.fields('email').REQUIRED)
    .optional()
    .default(undefined),
  userName: yup
    .string()
    .min(1, errorMessage.fields('firstName').REQUIRED)
    .optional()
    .default(undefined),
  profilePicture: yup
    .string()
    .min(1, errorMessage.fields('profilePicture').REQUIRED)
    .optional()
    .default(undefined),
  role: yup
    .mixed<UserRoleEnum>()
    .oneOf(Object.values(UserRoleEnum))
    .optional()
    .default(undefined),
  house: houseValidation.update.optional().default(undefined),
});

const create: yup.ObjectSchema<AuthRegisterApi> = yup.object({
  email: genericsValidation.email,
  password: genericsValidation.password,
  userName: yup
    .string()
    .required(errorMessage.fields('userName').REQUIRED)
    .typeError(errorMessage.fields('userName').NOT_STRING),
});

const login = yup.object<AuthLoginApi>().shape({
  email: genericsValidation.email.required(
    errorMessage.fields('email').REQUIRED,
  ),
  password: genericsValidation.password,
});

export const userValidation = {
  update,
  login,
  create,
};
