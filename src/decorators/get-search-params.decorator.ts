import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { SearchParams } from './../types/api';

function isNumber(v: any): boolean {
  return v && Number.isInteger(Number(v));
}

export function GenericGetSearchParams<T extends SearchParams = SearchParams>(
  _: any,
  context: ExecutionContext,
): T {
  const request = context.switchToHttp().getRequest();
  const query = request.query;
  return {
    page: query?.page && isNumber(query.page) ? +query.page : 0,
    pageSize:
      query?.pageSize && isNumber(query.pageSize) ? +query.pageSize : 10,
    search: query?.search ?? '',
    orderBy: query?.orderBy ?? 'createdAt',
    orderType: query?.orderType ?? 'DESC',
    ...(query as T),
  };
}

export const GetSearchParams = createParamDecorator(GenericGetSearchParams);
