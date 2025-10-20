// Utility types

// JSON value types
export type JSONPrimitive = string | number | boolean | null;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

// Parsed value types for JSON highlighter
export type ParsedValue =
  | { type: 'string'; value: string }
  | { type: 'number'; value: number }
  | { type: 'boolean'; value: boolean }
  | { type: 'null'; value: null }
  | { type: 'object'; value: Record<string, ParsedValue> }
  | { type: 'array'; value: ParsedValue[] };

// Generic utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type ValueOf<T> = T[keyof T];

// Event handler types
export type MouseEventHandler = (event: React.MouseEvent) => void;
export type ChangeEventHandler = (
  event: React.ChangeEvent<HTMLInputElement>
) => void;
export type FormEventHandler = (event: React.FormEvent) => void;
export type KeyboardEventHandler = (event: React.KeyboardEvent) => void;

// Async function types
export type AsyncFunction<T = void, R = void> = (arg: T) => Promise<R>;
export type AsyncVoidFunction = () => Promise<void>;

// State setter types
export type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

// Error types
export interface AppError {
  message: string;
  code?: string | number;
  stack?: string;
  details?: any;
}

// Result type for operations that can fail
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Sort types
export type SortDirection = 'asc' | 'desc';

export interface SortParams<T = string> {
  field: T;
  direction: SortDirection;
}

// Filter types
export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

// Time/Date utilities
export type Timestamp = number;
export type ISODateString = string;

// Theme types
export type Theme = 'light' | 'dark';

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStatus {
  state: LoadingState;
  error?: AppError;
}

// Generic ID types
export type UUID = string;
export type ID = string | number;
