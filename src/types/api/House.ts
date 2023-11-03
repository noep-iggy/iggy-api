export interface CreateHouseApi {
  name: string;
}

export interface UpdateHouseApi {
  name?: string;
  animalIds?: string[];
  userIds?: string[];
}
