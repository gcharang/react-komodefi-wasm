// WASM module and MM2 related types

export interface MM2Config {
  gui?: string;
  netid?: number;
  rpc_password?: string;
  passphrase?: string;
  userhome?: string;
  dbdir?: string;
  rpcip?: string;
  rpcport?: number;
  i_am_seed?: boolean;
  seednodes?: string[];
  enable_hd?: boolean;
  enable_tendermint?: boolean;
  tokens?: any[];
  coins?: any[];
}

export interface MM2StartParams {
  config: MM2Config | string;
  userpass?: string;
}

export interface MM2Status {
  running: boolean;
  version?: string;
  pid?: number;
  uptime?: number;
}

export interface MM2VersionInfo {
  result: string;
  datetime: string;
  git_hash?: string;
}

// Error types from WASM module
export enum MM2RpcError {
  NotRunning = 'NotRunning',
  InvalidPayload = 'InvalidPayload',
  InternalError = 'InternalError',
}

// WASM module exports
export interface KDFLib {
  mm2_main: (params: string, log_level: string) => string;
  mm2_version: () => string;
  mm2_main_status: () => number;
  mm2_stop: () => void;
  mm2_rpc: (request: string) => Promise<string>;
  Mm2RpcErr: typeof MM2RpcError;
}

// Log message types
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface LogMessage {
  timestamp: string;
  level: LogLevel;
  message: string;
  color?: string;
}

// WebAssembly module initialization
export interface WasmInitOptions {
  wasmPath: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

// RPC communication types for WASM
export interface WasmRpcRequest {
  jsonrpc?: string;
  id?: number | string;
  method: string;
  params?: any;
  userpass?: string;
}

export interface WasmRpcResponse<T = any> {
  jsonrpc?: string;
  id?: number | string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}
