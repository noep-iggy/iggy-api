export interface RegisterApi {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface JoinApi {
  firstName: string;
  password?: string;
  email?: string;
  lastName?: string;
}

export interface AuthLoginApi {
  email: string;
  password: string;
}
