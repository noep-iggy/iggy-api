import { errorMessage } from '@/errors';
import * as yup from 'yup';

const optionalObject = yup
  .object()
  .transform((value) => {
    if (
      value &&
      Object.values(value).some(
        (v) => !(v === null || v === undefined || v === ''),
      )
    )
      return value;
  })
  .default(undefined)
  .optional();

const email = yup.string().email(errorMessage.fields('email').NOT_VALID);

const password = yup
  .string()
  .required(errorMessage.fields('password').REQUIRED)
  .min(8, errorMessage.fields('password').TOO_SHORT)
  .matches(/[a-z]/, errorMessage.fields('password').NO_LETTER)
  .matches(/[A-Z]/, errorMessage.fields('password').NO_UPPERCASE)
  .matches(/[0-9]/, errorMessage.fields('password').NO_DIGIT)
  .matches(/[!@#$%^&*]/, errorMessage.fields('password').NO_SPECIAL_CHARACTER)
  .matches(/^[^\s]*$/, errorMessage.fields('password').HAS_SPACES);

export const validationGenerics = {
  email,
  password,
  optionalObject,
};
