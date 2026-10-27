import type { QueryOptions } from "../../interfaces";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyQueryOptions(query: any, options?: QueryOptions) {
  if (!options) return query;

  if (options.filters) {
    for (const filter of options.filters) {
      query = query.filter(filter.column, filter.operator, filter.value);
    }
  }

  if (options.order) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending ?? true,
    });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1);
  }

  return query;
}
