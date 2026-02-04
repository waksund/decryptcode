export interface ApiErrorDetails {
  missingFields?: string[];
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
}

export interface ApiError {
  errorCode?: string;
  errorDetails?: ApiErrorDetails;
}
