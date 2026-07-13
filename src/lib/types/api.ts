export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  meta?: PaginationMeta;
};

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SuccessResponse<T> = {
  data: T;
  error: null;
  meta?: PaginationMeta;
};

export type ErrorResponse = {
  data: null;
  error: ApiError;
};
