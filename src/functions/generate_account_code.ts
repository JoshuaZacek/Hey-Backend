import { readFile } from "fs/promises";
import random_integer from "./random_integer.js";

// Generates new account code from different words
export default async function generate_account_code(): Promise<string> {
  const wordsFile = await readFile("./src/words.txt", "utf-8");
  const words = wordsFile.split("\n");

  const account_code_array = [];

  for (let i = 0; i < 3; i++) {
    account_code_array.push(words[random_integer(0, words.length - 1)]);
  }

  return `${account_code_array[0]}-${account_code_array[1]}-${account_code_array[2]}`;
}
