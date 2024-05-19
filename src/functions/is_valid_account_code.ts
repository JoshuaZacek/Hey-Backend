export default function is_valid_account_code(account_code: string): boolean {
  return /^[a-z]{3,6}-[a-z]{3,6}-[a-z]{3,6}$/.test(account_code);
}
