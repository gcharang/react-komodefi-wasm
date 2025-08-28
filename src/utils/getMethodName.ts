/**
 * Extract method name(s) from RPC request configuration
 * Used for naming saved requests and response downloads
 */

export const getMethodNameFromConfig = (configString: string): string => {
  try {
    const request_json = JSON.parse(configString);
    
    if (Array.isArray(request_json)) {
      // Count occurrences of each method
      const methodCounts = new Map<string, number>();
      request_json.forEach((item) => {
        const method = item.method || 'unknown';
        methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
      });

      // Sort methods alphabetically and build the name
      const sortedMethods = Array.from(methodCounts.keys()).sort();
      const methodParts = sortedMethods.map((method) => {
        const count = methodCounts.get(method)!;
        return count > 1 ? `${method}${count}` : method;
      });

      return methodParts.join('-');
    } else {
      return request_json.method || 'request';
    }
  } catch {
    return 'request';
  }
};