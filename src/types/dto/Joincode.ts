export enum JoinCodeTypeEnum {
  PARENT = 'PARENT',
  CHILD = 'CHILD',
}

export interface JoinCodeDto {
  code: string;
  expirationDate: Date;
  type: JoinCodeTypeEnum;
  house: string;
}
