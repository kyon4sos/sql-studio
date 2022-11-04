import { DbConfig } from '@/common';
import log from 'electron-log';
import ClientFactory from '../core/client-factory';
import { Controller, Get, Post, Put } from '../core/decorator';
import { getDataBaseFile } from '../utils';
import Repository from '../repository';

@Controller('connections')
class ConnectionController {
  private repo;

  constructor() {
    const file = getDataBaseFile();
    log.error('getDataBaseFile ======', file);
    this.repo = Repository.getInstant();
  }

  @Get('/showDatabase')
  async getDataBase(id: string) {
    const client = await ClientFactory.getInstant().getClient(id);
    return client?.showDatabases();
  }

  @Get()
  getConnections() {
    return this.repo.listConnection();
  }

  @Put()
  update(data: DbConfig) {
    return this.repo.saveConnection(data);
  }

  @Post()
  save(data: DbConfig) {
    return this.repo.saveConnection(data);
  }
}

export default ConnectionController;
