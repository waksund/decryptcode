import type { ApiError } from '@/types/api';

export const formatApiError = (error: ApiError | null) => {
  if (!error?.errorCode) {
    return 'UNKNOWN_ERROR';
  }

  const parts = [error.errorCode];
  const missingFields = error.errorDetails?.missingFields;
  if (missingFields?.length) {
    parts.push(`missing: ${missingFields.join(', ')}`);
  }
  const fieldErrors = error.errorDetails?.fieldErrors;
  if (fieldErrors) {
    parts.push(`fields: ${Object.keys(fieldErrors).join(', ')}`);
  }
  return parts.join(' | ');
};
