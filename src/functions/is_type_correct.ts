// List of types this function can check
type Data_Types = "string" | "boolean" | "object" | "array" | "integer";

export default function is_type_correct(data: unknown, data_type: Data_Types): boolean {
  // Data is allowed to be undefined or null, so let them pass data type checks
  // If data is needed, then is_empty() function can be used after this one
  if (data === undefined || data === null) {
    return true;
  }

  // Can't use typeof operator for arrays, as typeof <array> returns object.
  // Array.isArray() function used instead.
  if (data_type == "array") {
    return Array.isArray(data);
  }

  if (data_type == "integer") {
    return Number.isInteger(data);
  }

  return typeof data == data_type;
}
