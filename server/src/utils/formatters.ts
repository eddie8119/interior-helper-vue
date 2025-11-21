const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const convertToSnakeCase = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map((v) => convertToSnakeCase(v));
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = camelToSnakeCase(key);
      acc[newKey] = convertToSnakeCase((obj as Record<string, unknown>)[key]);
      return acc;
    }, {} as Record<string, unknown>);
  }
  return obj;
};
