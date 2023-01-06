import { Pagination } from './pagination.util';

export class PaginationResult<T> extends Pagination {
  data: T[];
}
