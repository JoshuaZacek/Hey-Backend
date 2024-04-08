export default function is_empty(data: unknown): boolean {
  // If data is literally equal to undefined or null, it represents an "empty" state
  if (data === undefined || data === null) {
    return true;
  }

  // If data if string and string is literally equal to "" (empty string)
  if (typeof data == "string") {
    if (data === "") return true;

    return false;
  }

  // If data is an array and has no elements
  if (Array.isArray(data)) {
    if (data.length === 0) return true;

    return false;
  }

  // If data is object and has no key-value pairs to loop pver
  if (typeof data == "object") {
    // If no key-value pairs, this code is never run
    for (const key in data) {
      // Make sure key isn't inherited through prototype chain, but actually belongs to object
      const key_is_not_inherited = Object.prototype.hasOwnProperty.call(data, key);
      if (key_is_not_inherited) return false;
    }

    return true;
  }

  // If data is number or boolean, it can't be "empty"
  if (typeof data == "number" || typeof data == "boolean") {
    return false;
  }

  throw Error("Unsupported Type.");
}
