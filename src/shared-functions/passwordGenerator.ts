// Generate a random password for rpc_password and userpass
export function generateRandomPassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=';
  const allChars = lowercase + uppercase + numbers + special;
  
  // Ensure at least one character from each category
  let password = '';
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));
  
  // Fill the rest randomly (16 more characters for total of 20)
  for (let i = 4; i < 20; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password to avoid predictable pattern (first 4 chars being from each category)
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Store the password in memory for the session
let sessionPassword: string | null = null;

export function getSessionPassword(): string {
  if (!sessionPassword) {
    sessionPassword = generateRandomPassword();
  }
  return sessionPassword;
}

// Reset password (useful for testing)
export function resetSessionPassword(): void {
  sessionPassword = null;
}