export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = {
  handle(error: any): string {
    if (error.response?.status === 401) {
      return 'Please login again';
    }
    if (error.response?.status === 404) {
      return 'Resource not found';
    }
    if (error.response?.status === 500) {
      return 'Server error. Please try again later';
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An error occurred. Please try again';
  },

  isNetworkError(error: any): boolean {
    return (
      !error.response &&
      (error.message === 'Network Error' ||
        error.message?.includes('ECONNREFUSED'))
    );
  },

  isTimeoutError(error: any): boolean {
    return error.code === 'ECONNABORTED';
  },
};
