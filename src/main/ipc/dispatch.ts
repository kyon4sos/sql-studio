import { IpcEvent, RequestType } from '@/common';
import { ipcMain } from 'electron';
import 'reflect-metadata';
import { Router } from '@/core';
import * as controllers from '../controller';

// const isDev = process.env.NODE_ENV === 'development';

class Dispatch {
  private router;

  private controllerDir: string = '';

  private controllers = new WeakMap<object, Record<string, any>>();

  private static instant: Dispatch;

  static getInstant() {
    if (this.instant) {
      return this.instant;
    }
    return new Dispatch();
  }

  setControllerDir(dir: string) {
    this.controllerDir = dir;
    return this;
  }

  private constructor() {
    this.router = Router;
  }

  load() {
    Object.values(controllers).forEach((controller) => {
      const controllerInstant = Reflect.construct(
        controller as any,
        []
      ) as object;
      this.controllers.set(controller, controllerInstant);
    });
  }

  getController(target: object) {
    return this.controllers.get(target);
  }

  run() {
    this.load();
    Object.values(IpcEvent).forEach((event) => {
      this.on(event);
    });
  }

  on(evt: string) {
    ipcMain.handle(evt, (e, arg) => {
      console.log(evt);
      const { type = 'get', payload, url = '' } = arg as RequestType;
      const routerPath = `${evt}${url ? `/${url}` : ''}`;
      const handler = this.router.getRouter(routerPath, type);
      const { target, method } = handler ?? {};
      if (!target || !method) {
        return null;
      }
      const instant = this.getController(target);
      return instant && instant[method] && instant[method](payload);
    });
  }
}

export default Dispatch;
