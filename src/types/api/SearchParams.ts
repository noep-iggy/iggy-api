import { TaskStatusEnum } from '../dto';

export interface SearchParams {
  search?: string;
  pageSize?: number;
  page?: number;
  orderBy?: string;
  orderType?: 'ASC' | 'DESC';
}

export interface TaskSearchParams extends SearchParams {
  date?: 'today' | 'tomorrow' | 'week' | 'month';
  status?: TaskStatusEnum;
  isArchived?: boolean;
  animalId?: string;
}

export interface ApiSearchResponse<T> {
  items: T[];
  total: number;
  page: number;
}
