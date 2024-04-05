// Min and max are both inclusive
export default function random_integer(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
