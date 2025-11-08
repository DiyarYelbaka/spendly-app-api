/**
 * Pagination Utility
 * Helper functions for pagination calculations
 */

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationResult {
  total: number;
  current_page: number;
  per_page: number;
}

/**
 * Parse pagination parameters from query
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20, max: 100)
 * @returns Pagination parameters
 */
export function parsePagination(
  page?: number | string,
  limit?: number | string,
): PaginationParams {
  const parsedPage = page
    ? Math.max(1, parseInt(String(page), 10) || 1)
    : 1;
  const parsedLimit = limit
    ? Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20))
    : 20;
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
}

/**
 * Create pagination result object
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination result
 */
export function createPaginationResult(
  total: number,
  page: number,
  limit: number,
): PaginationResult {
  return {
    total,
    current_page: page,
    per_page: limit,
  };
}

