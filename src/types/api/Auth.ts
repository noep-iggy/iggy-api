export interface AuthRegisterApi {
  email?: string;
  password: string;
  userName: string;
}

export interface AuthLoginApi {
  userName: string;
  password: string;
}
