// Type declaration to fix resend package type error
// This is a workaround for a known issue in resend@6.7.0 type definitions
declare module 'resend' {
  export class Resend {
    constructor(apiKey?: string);
    emails: {
      send(options: any): Promise<any>;
    };
  }
  
  export interface CreateEmailOptions {
    react?: React.ReactElement | string;
    [key: string]: any;
  }
}
