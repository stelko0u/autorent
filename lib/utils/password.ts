import crypto from 'crypto';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}:,.?';

function randomFrom(chars: string): string {
  return chars[crypto.randomInt(0, chars.length)]!;
}

function shuffle(input: string): string {
  const arr = input.split('');
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr.join('');
}

export function generateTemporaryPassword(length = 14): string {
  if (length < 12) {
    throw new Error('temporary_password_length_too_short');
  }

  const all = `${LOWER}${UPPER}${DIGITS}${SYMBOLS}`;
  let password =
    randomFrom(LOWER) +
    randomFrom(UPPER) +
    randomFrom(DIGITS) +
    randomFrom(SYMBOLS);

  for (let i = password.length; i < length; i += 1) {
    password += randomFrom(all);
  }

  return shuffle(password);
}
