declare module 'post-robot' {
  export interface PostRobotConfig {
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  }

  export interface SendOptions {
    timeout?: number;
    domain?: string | string[];
    window?: Window;
  }

  export interface EventOptions {
    window?: Window;
    domain?: string | string[];
  }

  export interface EventData<T = any> {
    origin: string;
    source: Window;
    data: T;
  }

  export interface ResponseData<T = any> {
    data: T;
  }

  export const CONFIG: PostRobotConfig;

  export function sendToParent<T = any>(
    name: string,
    data?: any,
    options?: SendOptions
  ): Promise<ResponseData<T>>;

  export function send<T = any>(
    window: Window,
    name: string,
    data?: any,
    options?: SendOptions
  ): Promise<ResponseData<T>>;

  export function on<T = any>(
    name: string,
    options: EventOptions,
    handler: (event: EventData<T>) => Promise<any> | any
  ): { cancel: () => void };

  export function once<T = any>(
    name: string,
    options: EventOptions,
    handler: (event: EventData<T>) => Promise<any> | any
  ): { cancel: () => void };

  export function off(name: string, handler?: Function): void;
}