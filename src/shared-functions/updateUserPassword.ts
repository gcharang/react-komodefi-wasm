export function updateUserPass(jsonData: any, newPassword: string): any {
  try {
    // Check if the input data is an object
    if (typeof jsonData === "object") {
      // If it's an array, iterate over its elements
      if (Array.isArray(jsonData)) {
        for (let i = 0; i < jsonData.length; i++) {
          jsonData[i] = updateUserPass(jsonData[i], newPassword);
        }
      } else {
        // If it's an object, iterate over its properties
        for (const key in jsonData) {
          if (jsonData.hasOwnProperty(key)) {
            // Recursively update the "userpass" value if found
            if (key === "userpass") {
              jsonData[key] = newPassword;
            } else {
              // Recursively traverse nested objects and arrays
              jsonData[key] = updateUserPass(jsonData[key], newPassword);
            }
          }
        }
      }
    }
    return jsonData;
  } catch (error) {
    console.error("An error occurred", error);
    return null;
  }
}
