/**
 * Local Configuration Loader for Development
 * Loads configuration from local files when running on localhost
 */

export const isLocalhost = (): boolean => {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]' || // IPv6 localhost
    window.location.hostname.startsWith('192.168.') || // Local network
    window.location.hostname.startsWith('10.') // Local network
  );
};

export const loadLocalMM2Config = async (): Promise<string | null> => {
  if (!isLocalhost()) {
    return null;
  }

  try {
    const response = await fetch('/local_MM2.json');
    if (response.ok) {
      const config = await response.json();
      console.log('✅ Loaded local MM2 configuration from local_MM2.json');
      return JSON.stringify(config, null, 2);
    }
  } catch (error) {
    // File doesn't exist or couldn't be parsed - this is fine
    console.debug('No local_MM2.json found, using default configuration');
  }
  
  return null;
};

export const loadLocalRPCConfig = async (): Promise<string | null> => {
  if (!isLocalhost()) {
    return null;
  }

  try {
    const response = await fetch('/local_RPC.json');
    if (response.ok) {
      const config = await response.json();
      
      // If the config has placeholder password, don't use it
      if (JSON.stringify(config).includes('your_rpc_password_here')) {
        console.debug('Local RPC config contains placeholder password, skipping');
        return null;
      }
      
      console.log('✅ Loaded local RPC configuration from local_RPC.json');
      return JSON.stringify(config, null, 2);
    }
  } catch (error) {
    // File doesn't exist or couldn't be parsed - this is fine
    console.debug('No local_RPC.json found, using default configuration');
  }
  
  return null;
};

/**
 * Merges local config with defaults, preserving local values
 */
export const mergeWithDefaults = (localConfig: any, defaultConfig: string): string => {
  try {
    const defaults = JSON.parse(defaultConfig);
    const merged = { ...defaults, ...localConfig };
    
    // Ensure arrays are replaced, not merged
    Object.keys(localConfig).forEach(key => {
      if (Array.isArray(localConfig[key])) {
        merged[key] = localConfig[key];
      }
    });
    
    return JSON.stringify(merged, null, 2);
  } catch (error) {
    console.error('Error merging configurations:', error);
    return defaultConfig;
  }
};

/**
 * Extracts RPC password from MM2 config if available
 */
export const extractRpcPassword = (mm2Config: string): string | null => {
  try {
    const config = JSON.parse(mm2Config);
    return config.rpc_password || null;
  } catch {
    return null;
  }
};

/**
 * Updates RPC config with the correct password from MM2 config
 */
export const syncRpcPassword = (rpcConfig: string, password: string): string => {
  try {
    const config = JSON.parse(rpcConfig);
    
    if (Array.isArray(config)) {
      // Update password in all array items
      const updated = config.map(item => ({
        ...item,
        userpass: password
      }));
      return JSON.stringify(updated, null, 2);
    } else {
      // Single config object
      config.userpass = password;
      return JSON.stringify(config, null, 2);
    }
  } catch (error) {
    console.error('Error syncing RPC password:', error);
    return rpcConfig;
  }
};