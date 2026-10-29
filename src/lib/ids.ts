export function generateOrderNumber() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `IN-${datePart}-${randomPart}`;
}

export function generateSku(prefix: string) {
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${randomPart}`;
}
