// Type definitions for KDF WASM library

export enum LogLevel {
  Off = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
  Trace = 5,
}

export enum MainStatus {
  NotRunning = 0,
  NoContext = 1,
  NoRpc = 2,
  RpcIsUp = 3,
}

export interface MM2Params {
  conf: {
    gui?: string;
    passphrase?: string;
    rpc_password?: string;
    netid?: number;
    seednodes?: string[];
    coins?: any[];
  };
  log_level: LogLevel;
}

export interface MM2Version {
  result: string;
  datetime: string;
}

export type LogHandler = (level: LogLevel, line: string) => void;

// WASM module functions
export declare function init(wasmUrl: URL): Promise<void>;
export declare function mm2_main(params: MM2Params, handleLog: LogHandler): void;
export declare function mm2_main_status(): MainStatus;
export declare function mm2_stop(): void;
export declare function mm2_version(): MM2Version;