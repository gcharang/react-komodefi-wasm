export function generatePassword() {
  const length = Math.floor(Math.random() * (32 - 8 + 1)) + 8; // Random length between 8 and 32
  const numeric = "0123456789";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const special = "!#$*";
  const allCharacters = numeric + uppercase + lowercase + special;
  let password = "";
  let hasNumeric = false;
  let hasUppercase = false;
  let hasLowercase = false;
  let hasSpecial = false;

  function getRandomChar(str) {
    return str.charAt(Math.floor(Math.random() * str.length));
  }

  // Ensure at least one of each required character type is included
  password += getRandomChar(numeric);
  hasNumeric = true;

  password += getRandomChar(uppercase);
  hasUppercase = true;

  password += getRandomChar(lowercase);
  hasLowercase = true;

  password += getRandomChar(special);
  hasSpecial = true;

  while (password.length < length) {
    const char = getRandomChar(allCharacters);
    const lastChar = password.length > 0 ? password[password.length - 1] : "";
    const secondLastChar =
      password.length > 1 ? password[password.length - 2] : "";

    if (char === lastChar && char === secondLastChar) {
      continue; // Prevent 3 identical characters in a row
    }

    password += char;

    if (numeric.includes(char)) hasNumeric = true;
    if (uppercase.includes(char)) hasUppercase = true;
    if (lowercase.includes(char)) hasLowercase = true;
    if (special.includes(char)) hasSpecial = true;
  }

  // Shuffle the password to remove predictable patterns
  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  // Ensure the password length is within the required range
  return password.substring(0, Math.min(password.length, 32));
}
