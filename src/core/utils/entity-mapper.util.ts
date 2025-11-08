/**
 * Entity Mapper Utility
 * Helper functions for converting Prisma models to API response format
 * Converts camelCase to snake_case for API consistency
 */

/**
 * Convert object keys from camelCase to snake_case
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Recursively convert object keys to snake_case
 */
function convertKeysToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase);
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = toSnakeCase(key);
        converted[snakeKey] = convertKeysToSnakeCase(obj[key]);
      }
    }
    return converted;
  }

  return obj;
}

/**
 * Format Category entity for API response
 */
export function formatCategory(category: any): any {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    icon: category.icon,
    color: category.color,
    description: category.description,
    sort_order: category.sortOrder,
    is_active: category.isActive,
    is_default: category.isDefault,
    created_at: category.createdAt,
    ...(category.updatedAt && { updated_at: category.updatedAt }),
    ...(category.stats && { stats: category.stats }),
    ...(category._count && {
      transaction_count: category._count.transactions,
    }),
  };
}

/**
 * Format Transaction entity for API response
 */
export function formatTransaction(transaction: any): any {
  return {
    id: transaction.id,
    amount: transaction.amount?.toNumber?.() || transaction.amount,
    type: transaction.type,
    description: transaction.description,
    category: transaction.category
      ? {
          id: transaction.category.id,
          name: transaction.category.name,
          icon: transaction.category.icon,
          color: transaction.category.color,
        }
      : undefined,
    category_id: transaction.categoryId,
    date: transaction.date
      ? (typeof transaction.date === 'string'
          ? transaction.date
          : transaction.date.toISOString().split('T')[0])
      : undefined,
    notes: transaction.notes,
    created_at: transaction.createdAt,
    ...(transaction.updatedAt && { updated_at: transaction.updatedAt }),
  };
}

/**
 * Generic entity formatter - converts camelCase to snake_case
 * Use this for simple entities that just need key conversion
 */
export function formatEntity(entity: any): any {
  return convertKeysToSnakeCase(entity);
}

