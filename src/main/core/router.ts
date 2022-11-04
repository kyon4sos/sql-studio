import { MethodType } from '@/common';

class Router {
  private static router = new Map<string, RouterHandler>();

  private static split = '::';

  private static genKey(url: string, method: string) {
    return `${url}${this.split}${method}`;
  }

  static listRouter() {
    return this.router;
  }

  static getRouter(url: string, method: string) {
    const key = this.genKey(url, method);
    return Router.router.get(key);
  }

  static setRouter(url: string, method: string, handler: RouterHandler) {
    const key = this.genKey(url, method);
    this.router.set(key, handler);
  }
}

export type RouterHandler = {
  type: MethodType;
  method: string;
  target: any;
  descriptor: any;
};

export { Router };
