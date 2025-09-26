export interface BceConfig {
  endpoint: string;
  credentials: {
    ak: string;
    sk: string;
  };
  [key: string]: any;
}

export interface BceResponse<T = any> {
  body: T;
  headers: Record<string, string>;
  status: number;
  [key: string]: any;
}
