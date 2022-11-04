/* eslint-disable import/prefer-default-export */
import { MethodType } from '@/common';
import 'reflect-metadata';
import { Router } from '../router';

class RouterMetaData {
  url: string;

  method: string;

  type: MethodType;

  descriptor: PropertyDescriptor;

  constructor(url: string, method: string, type: MethodType, descriptor: any) {
    this.url = url;
    this.method = method;
    this.type = type;
    this.descriptor = descriptor;
  }
}

const UrlKey = Symbol('UrlKey');

function getMetaData(key: PropertyKey, target: object) {
  return Reflect.getMetadata(key, target);
}

function setMetaData(
  key: PropertyKey,
  value: RouterMetaData[] | RouterMetaData,
  target: object
) {
  Reflect.defineMetadata(key, value, target);
}

type DecoratorOption = {
  target: new (...arg: any[]) => any;
  url: string | undefined;
  propertyKey: string;
  descriptor: PropertyDescriptor;
  key: symbol;
  type: MethodType;
};

function methodDecorator(option: DecoratorOption) {
  const { propertyKey, target, url = '', type, descriptor } = option;
  setMetaData(
    `${url}${type}`,
    new RouterMetaData(url, propertyKey, type, descriptor),
    target.constructor
  );
}

const RouterDecorator =
  (url: string, type: MethodType) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) =>
    methodDecorator({
      target,
      propertyKey,
      descriptor,
      url,
      type,
      key: UrlKey,
    });

const Put = (url = '') => RouterDecorator(url, 'put');

const Get = (url = '') => RouterDecorator(url, 'get');

const Post = (url = '') => RouterDecorator(url, 'post');

const addRouter = (prefix: string, target: any) => {
  const keys = Reflect.getMetadataKeys(target) as PropertyKey[];
  keys.forEach((key) => {
    const meta = getMetaData(key, target);
    if (!meta) {
      return;
    }
    if (meta instanceof RouterMetaData) {
      const { url, type, method, descriptor } = meta;
      const routerPath = `${prefix}${url}`;
      Router.setRouter(routerPath, type, {
        type,
        method,
        target,
        descriptor,
      });
    }
  });
};

function Controller(prefix: string) {
  return function (target: any) {
    addRouter(prefix, target);
  };
}

export { Get, Controller, Post, Put };
