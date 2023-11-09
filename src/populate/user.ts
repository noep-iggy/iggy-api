import { AuthRegisterApi } from '@/types';

const parent: AuthRegisterApi = {
  userName: 'Dorian',
  email: 'dorian@gmail.com',
  password: 'Azerty12!',
};

const child: AuthRegisterApi = {
  userName: 'Noé',
  password: 'Azerty12!',
};

export const user = {
  parent,
  child,
};
