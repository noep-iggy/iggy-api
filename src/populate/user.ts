import { JoinApi, RegisterApi } from '@/types';

const parent: RegisterApi = {
  firstName: 'Dorian',
  lastName: 'Bouillet',
  email: 'dorian@gmail.com',
  password: 'Azerty12!',
};

const child: JoinApi = {
  firstName: 'Noé',
};

export const user = {
  parent,
  child,
};
