export const normalizeToArray = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];
