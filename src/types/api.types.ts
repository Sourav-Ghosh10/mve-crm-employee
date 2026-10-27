export interface ApiError {
  message: string;
  statusCode: number;
}

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  error?: {
    message?: string;
    code?: string;
    details?: any[];
    [key: string]: any;
  };
  [key: string]: any;
}
