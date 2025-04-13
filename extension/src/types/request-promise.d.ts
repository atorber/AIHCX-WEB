declare module 'request-promise' {
  interface RequestOptions {
    method?: string;
    uri?: string;
    qs?: any;
    headers?: any;
    json?: boolean;
    body?: any;
    [key: string]: any;
  }

  function rp(options: RequestOptions): Promise<any>;
  
  export default rp;
} 