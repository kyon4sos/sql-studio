import { DbConfig } from '@/common';
import { SqlClient } from '../clients';
import Repository from '../repository';

class ClientFactory {
  private clients;

  private repo;

  static getInstant() {
    const repo = Repository.getInstant();
    return new ClientFactory(repo);
  }

  private constructor(repo: Repository) {
    this.clients = new Map<string, SqlClient>();
    this.repo = repo;
  }

  // eslint-disable-next-line class-methods-use-this
  connect(config: DbConfig) {
    return new SqlClient(config);
  }

  set(id: string, config: DbConfig): SqlClient {
    const client = this.connect(config);
    this.clients.set(id, client);
    return client;
  }

  async getClient(id: string, database?: string): Promise<SqlClient | null> {
    const key = database === undefined ? id : `${id}||${database}`;
    const client = this.clients.get(key);
    if (client) {
      return client;
    }
    const config = await this.repo.getConnectionById(id);
    if (!config) {
      return null;
    }
    database && (config.database = database);
    return this.set(key, config);
  }
}

export default ClientFactory;
