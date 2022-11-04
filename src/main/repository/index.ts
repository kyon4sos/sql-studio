import { DbConfig, TabType } from '@/common';
import knexFun from 'knex';
import { getDataBaseFile } from '../utils';

class Repository {
  private knex;

  private static instant: Repository;

  private tableName = {
    Connections: 'Connections',
    Tabs: 'Tabs',
  };

  static getInstant() {
    if (this.instant) {
      return this.instant;
    }
    const filename = getDataBaseFile();
    return new Repository(filename);
  }

  constructor(filename: string) {
    this.knex = knexFun({
      client: 'sqlite3',
      connection: {
        filename,
      },
    });
  }

  private getById<T>(
    tableName: string,
    id: string | number
  ): Promise<T | null> {
    return this.knex(tableName).where({ id }).first();
  }

  private saveOrUpdate(tabName: string, data: Record<string, any>) {
    const { id } = data ?? {};
    if (id) {
      return this.knex(tabName).where({ id }).update(data);
    }
    return this.knex(tabName).insert(data);
  }

  private removeById(tableName: string, id: string | number) {
    return this.knex(tableName).where('id', id).del();
  }

  private list(tableName: string) {
    return this.knex.select('*').from(tableName);
  }

  private save(data: TabType) {
    this.saveOrUpdate(this.tableName.Tabs, data);
  }

  getConnectionById(id: string) {
    return this.getById<DbConfig>(this.tableName.Connections, id);
  }

  saveConnection(data: DbConfig) {
    this.saveOrUpdate(this.tableName.Connections, data);
  }

  removeConnectionById(id: string) {
    return this.removeById(this.tableName.Connections, id);
  }

  listTabs() {
    return this.list(this.tableName.Tabs);
  }

  listConnection() {
    return this.list(this.tableName.Connections);
  }
}

export default Repository;
