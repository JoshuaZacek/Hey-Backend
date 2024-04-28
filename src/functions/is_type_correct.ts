// List of types this function can check
type Data_Types = "string" | "boolean" | "object" | "array" | "integer" | "uuid";

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

  // Special type for strings in UUID format
  if (data_type == "uuid") {
    // UUID is a type of string, so if data isn't a string, then we know data isn't a UUID
    if (typeof data != "string") return false;

    // Regex for UUID v4
    const uuid_regex =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

    return uuid_regex.test(data);
  }

  return typeof data == data_type;
}
