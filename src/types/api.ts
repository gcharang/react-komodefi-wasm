// API request and response types

export interface RpcRequest {
  userpass: string;
  method: string;
  mm2?: number;
  id?: number | string;
  [key: string]: any; // Additional method-specific parameters
}

export interface RpcResponse<T = any> {
  result?: T;
  error?: string | RpcError;
  id?: number | string;
}

export interface RpcError {
  code?: number;
  message: string;
  data?: any;
}

// RPC Method definitions from Postman collection
export interface RpcMethod {
  name: string;
  method: string;
  userpass?: string;
  mm2?: number;
  // Method-specific parameters
  [key: string]: any;
}

export interface RpcMethodCategory {
  name: string;
  methods: RpcMethod[];
}

// Postman collection types
export interface PostmanRequest {
  method: string;
  header?: any[];
  body?: {
    mode?: string;
    raw?: string;
  };
  url?: string | PostmanUrl;
}

export interface PostmanUrl {
  raw?: string;
  protocol?: string;
  host?: string[];
  port?: string;
  path?: string[];
}

export interface PostmanItem {
  name: string;
  request?: PostmanRequest;
  response?: any[];
  item?: PostmanItem[]; // Nested items for folders
}

export interface PostmanCollection {
  info: {
    name: string;
    schema: string;
    _postman_id?: string;
  };
  item: PostmanItem[];
  variable?: any[];
}

// Method collection after processing
export type MethodCollection = Record<string, RpcMethod[]>;