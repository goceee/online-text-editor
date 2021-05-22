export interface IProcessEnv {
  HOSTNAME: string;
  PORT: string;
  DATABASE_URL: string;
  ENVIRONMENT: 'development' | 'production';
  SECRET: string;
}

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends IProcessEnv {}
  }
}
