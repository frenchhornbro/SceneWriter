export function validateId(id: any): number | null {
  const num = Number(id);
  if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
    return null;
  }
  return num;
}