/**
 * Generic API response type for consistent typing across the application
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
