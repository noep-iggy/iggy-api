export enum JoincodeTypeEnum {
  PARENT = 'PARENT',
  CHILD = 'CHILD',
}

export interface JoinCodeDto {
  parent: string;
  child: string;
}
