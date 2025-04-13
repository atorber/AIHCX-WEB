declare module '@baiducloud/sdk' {
  export class Auth {
    constructor(ak: string, sk: string);
    generateAuthorization(
      method: string,
      path: string,
      query: any,
      headers: any,
      timestamp: number,
      expirationPeriondInSeconds: number
    ): string;
  }
} 