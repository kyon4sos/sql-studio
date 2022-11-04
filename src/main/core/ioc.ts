class IOC {
  container = new Map();

  get(name: string) {
    return this.container.get(name);
  }

  set(name: string, item: any) {
    this.container.set(name, item);
  }
}

const ioc = new IOC();

export { ioc };
