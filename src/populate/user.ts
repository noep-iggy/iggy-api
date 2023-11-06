import { AuthRegisterApi } from '@/types';

const register: AuthRegisterApi = {
  userName: 'John',
  email: 'john@gmail.com',
  password: 'Azerty12!',
};

const users: AuthRegisterApi[] = [
  {
    userName: 'Dorian',
    password: 'Azerty12!',
  },
  {
    userName: 'Noé',
    password: 'Azerty12!',
  },
];

export const user = {
  register,
  standard: users,
};
