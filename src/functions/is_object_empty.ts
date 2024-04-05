// If object is empty, then there is nothing to loop over, so return statement inside for loop is never reached
export default function is_object_empty(object: object) {
  for (const _key in object) {
    return false;
  }

  return true;
}
