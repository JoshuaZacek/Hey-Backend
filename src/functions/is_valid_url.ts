export default function is_valid_url(string: string): boolean {
  let url;

  try {
    url = new URL(string);
  } catch {
    return false;
  }

  return url.protocol == "http:" || url.protocol == "https:";
}
