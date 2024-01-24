import { TaskStatusEnum } from '../dto';

export interface SearchParams {
  search?: string;
  pageSize?: number;
  page?: number;
  orderBy?: string;
  orderType?: 'ASC' | 'DESC';
}

export interface TaskSearchParams extends SearchParams {
  date?: 'today' | 'week' | 'month';
  status?: TaskStatusEnum;
}

export interface ApiSearchResponse<T> {
  items: T[];
  total: number;
  page: number;
}
