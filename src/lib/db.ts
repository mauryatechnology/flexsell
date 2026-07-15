export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function findById<T extends { _id: string }>(
  collection: T[],
  id: string
): T | undefined {
  return collection.find((item) => item._id === id);
}

export function findBySlug<T extends { slug: string }>(
  collection: T[],
  slug: string
): T | undefined {
  return collection.find((item) => item.slug === slug);
}

export function findMany<T>(
  collection: T[],
  filter?: Partial<T>
): T[] {
  if (!filter) return collection;

  return collection.filter((item) => {
    return Object.entries(filter).every(([key, value]) => {
      return item[key as keyof T] === value;
    });
  });
}

export function paginate<T>(
  collection: T[],
  page: number = 1,
  limit: number = 10
): PaginatedResult<T> {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: collection.slice(startIndex, endIndex),
    total: collection.length,
    page,
    limit,
    totalPages: Math.ceil(collection.length / limit),
  };
}

export function search<T>(
  collection: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  const lowerQuery = query.toLowerCase();
  
  return collection.filter((item) => {
    return fields.some((field) => {
      const value = item[field];
      if (typeof value === "string") {
        return value.toLowerCase().includes(lowerQuery);
      }
      return false;
    });
  });
}
