/**
 * Saved Requests Manager
 * Manages RPC request templates in localStorage
 */

export interface SavedRequest {
  name: string;
  config: string;
  savedAt: string;
  usageCount: number;
  includesPassword?: boolean;
}

export interface SavedRequestsCollection {
  [key: string]: SavedRequest;
}

const STORAGE_KEY = 'kdf_saved_requests';

/**
 * Get all saved requests from localStorage
 */
export const getSavedRequests = (): SavedRequestsCollection => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error loading saved requests:', error);
    return {};
  }
};

/**
 * Generate a unique name by adding a counter if needed
 */
export const generateUniqueName = (baseName: string): string => {
  const saved = getSavedRequests();
  
  // If the base name doesn't exist, use it
  if (!(baseName in saved)) {
    return baseName;
  }
  
  // Find the next available counter
  let counter = 2;
  while (`${baseName}_${counter}` in saved) {
    counter++;
  }
  
  return `${baseName}_${counter}`;
};

/**
 * Save a request configuration with a custom name
 * Always strips password/userpass for security
 */
export const saveRequest = (
  name: string, 
  config: string, 
  overwrite: boolean = true
): string => {
  try {
    const saved = getSavedRequests();
    
    // Always strip password when saving
    const configToSave = stripPassword(config);
    
    // Create or update the saved request
    saved[name] = {
      name: name,
      config: configToSave,
      savedAt: new Date().toISOString(),
      usageCount: saved[name]?.usageCount || 0,
      includesPassword: false
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return name; // Return the name used
  } catch (error) {
    console.error('Error saving request:', error);
    throw new Error('Failed to save request');
  }
};

/**
 * Load a saved request by name
 */
export const loadRequest = (name: string): SavedRequest | null => {
  try {
    const saved = getSavedRequests();
    const request = saved[name];
    
    if (request) {
      // Increment usage count
      request.usageCount++;
      saved[name] = request;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      
      return request;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading request:', error);
    return null;
  }
};

/**
 * Delete a saved request by name
 */
export const deleteRequest = (name: string): void => {
  try {
    const saved = getSavedRequests();
    delete saved[name];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch (error) {
    console.error('Error deleting request:', error);
  }
};

/**
 * Check if a request name already exists
 */
export const requestExists = (name: string): boolean => {
  const saved = getSavedRequests();
  return name in saved;
};

/**
 * Strip password/userpass from config
 */
const stripPassword = (config: string): string => {
  try {
    const parsed = JSON.parse(config);
    
    if (Array.isArray(parsed)) {
      return JSON.stringify(
        parsed.map(item => {
          const { userpass, ...rest } = item;
          return { ...rest, userpass: "YOUR_PASSWORD_HERE" };
        }),
        null,
        2
      );
    } else {
      const { userpass, ...rest } = parsed;
      return JSON.stringify(
        { ...rest, userpass: "YOUR_PASSWORD_HERE" },
        null,
        2
      );
    }
  } catch {
    // If not valid JSON, return as-is
    return config;
  }
};

/**
 * Get recently used requests (sorted by usage count and recent access)
 */
export const getRecentRequests = (limit: number = 5): SavedRequest[] => {
  const saved = getSavedRequests();
  return Object.values(saved)
    .sort((a, b) => {
      // First sort by usage count, then by saved date
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    })
    .slice(0, limit);
};

/**
 * Export all saved requests as JSON string
 */
export const exportRequests = (): string => {
  const saved = getSavedRequests();
  return JSON.stringify(saved, null, 2);
};

/**
 * Import requests from JSON string
 */
export const importRequests = (jsonString: string, overwrite: boolean = false): void => {
  try {
    const imported = JSON.parse(jsonString) as SavedRequestsCollection;
    
    if (!overwrite) {
      // Merge with existing
      const existing = getSavedRequests();
      const merged = { ...existing, ...imported };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } else {
      // Replace all
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    }
  } catch (error) {
    console.error('Error importing requests:', error);
    throw new Error('Invalid import format');
  }
};

/**
 * Clear all saved requests
 */
export const clearAllRequests = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};