/**
 * Saved MM2 Configs Manager
 * Manages MM2 configuration templates in localStorage
 */

export interface SavedMm2Config {
  name: string;
  config: string;
  savedAt: string;
  usageCount: number;
  lastUsedAt?: string;
}

export interface SavedMm2ConfigsCollection {
  [key: string]: SavedMm2Config;
}

const STORAGE_KEY = 'kdf_saved_mm2_configs';

/**
 * Get all saved MM2 configs from localStorage
 */
export const getSavedMm2Configs = (): SavedMm2ConfigsCollection => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error loading saved MM2 configs:', error);
    return {};
  }
};

/**
 * Generate a unique name by adding a counter if needed
 */
export const generateUniqueName = (baseName: string = 'mm2_config'): string => {
  const saved = getSavedMm2Configs();
  
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
 * Save an MM2 configuration with a custom name
 * Always strips rpc_password for security
 */
export const saveMm2Config = (
  name: string, 
  config: string, 
  overwrite: boolean = true
): string => {
  try {
    const saved = getSavedMm2Configs();
    
    // Always strip password when saving
    const configToSave = stripPassword(config);
    
    // Create or update the saved config
    saved[name] = {
      name: name,
      config: configToSave,
      savedAt: new Date().toISOString(),
      usageCount: saved[name]?.usageCount || 0
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return name; // Return the name used
  } catch (error) {
    console.error('Error saving MM2 config:', error);
    throw new Error('Failed to save MM2 config');
  }
};

/**
 * Load a saved MM2 config by name
 */
export const loadMm2Config = (name: string): SavedMm2Config | null => {
  try {
    const saved = getSavedMm2Configs();
    const config = saved[name];
    
    if (config) {
      // Increment usage count and update last used time
      config.usageCount++;
      config.lastUsedAt = new Date().toISOString();
      saved[name] = config;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      
      return config;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading MM2 config:', error);
    return null;
  }
};

/**
 * Delete a saved MM2 config by name
 */
export const deleteMm2Config = (name: string): void => {
  try {
    const saved = getSavedMm2Configs();
    delete saved[name];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch (error) {
    console.error('Error deleting MM2 config:', error);
  }
};

/**
 * Check if a config name already exists
 */
export const configExists = (name: string): boolean => {
  const saved = getSavedMm2Configs();
  return name in saved;
};

/**
 * Strip rpc_password from config and set passphrase to wasmtest
 */
const stripPassword = (config: string): string => {
  try {
    const parsed = JSON.parse(config);
    return JSON.stringify(
      { 
        ...parsed, 
        rpc_password: "YOUR_PASSWORD_HERE",
        passphrase: "wasmtest"
      },
      null,
      2
    );
  } catch {
    // If not valid JSON, return as-is
    return config;
  }
};

/**
 * Export all saved MM2 configs as JSON string
 */
export const exportMm2Configs = (): string => {
  const saved = getSavedMm2Configs();
  return JSON.stringify(saved, null, 2);
};

/**
 * Import MM2 configs from JSON string
 */
export const importMm2Configs = (jsonString: string, overwrite: boolean = false): void => {
  try {
    const imported = JSON.parse(jsonString) as SavedMm2ConfigsCollection;
    
    if (!overwrite) {
      // Intelligent merge with existing
      const existing = getSavedMm2Configs();
      const merged = { ...existing };
      
      // Merge each imported config intelligently
      Object.entries(imported).forEach(([name, importedConfig]) => {
        if (merged[name]) {
          // Config exists - merge intelligently
          const existingConfig = merged[name];
          merged[name] = {
            name: name,
            config: importedConfig.config, // Use newer config from import
            savedAt: new Date(existingConfig.savedAt) < new Date(importedConfig.savedAt) 
              ? existingConfig.savedAt 
              : importedConfig.savedAt, // Keep earliest creation date
            usageCount: existingConfig.usageCount + importedConfig.usageCount, // Sum usage counts
            lastUsedAt: (() => {
              // Keep most recent usage date
              const existingUsed = existingConfig.lastUsedAt ? new Date(existingConfig.lastUsedAt) : null;
              const importedUsed = importedConfig.lastUsedAt ? new Date(importedConfig.lastUsedAt) : null;
              
              if (!existingUsed && !importedUsed) return undefined;
              if (!existingUsed) return importedConfig.lastUsedAt;
              if (!importedUsed) return existingConfig.lastUsedAt;
              
              return existingUsed > importedUsed 
                ? existingConfig.lastUsedAt 
                : importedConfig.lastUsedAt;
            })()
          };
        } else {
          // New config - add it
          merged[name] = importedConfig;
        }
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } else {
      // Replace all
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    }
  } catch (error) {
    console.error('Error importing MM2 configs:', error);
    throw new Error('Invalid import format');
  }
};

/**
 * Clear all saved MM2 configs
 */
export const clearAllMm2Configs = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};