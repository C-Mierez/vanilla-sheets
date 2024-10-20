// Utility selector functions
export const $ = (query: string) => document.querySelector(query);
export const $$ = (query: string) => document.querySelectorAll(query);

// Declarative iteration range function
export const range = (length: number) => Array.from({ length }, (_, i) => i);

// Map ASCII numbers to letters.
// Receives a number from 1 to 26 and returns the corresponding letter.
// Concatenates the letters when exceeding 26.
// Example: toASCII(1) = "AA" and toASCII(27) = "BA"
export function toASCII(number: number): string {
    const remainder = number % 26;
    const quotient = Math.floor(number / 26);
    return quotient > 0 ? toASCII(quotient) + String.fromCharCode(remainder + 65) : String.fromCharCode(remainder + 65);
}
