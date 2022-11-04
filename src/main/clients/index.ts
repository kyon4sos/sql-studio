/* eslint-disable @typescript-eslint/no-explicit-any */
import knex from 'knex';
import type { Knex } from 'knex';
import { identify } from 'sql-query-identifier';
import schemaInspector from 'knex-schema-inspector';
import type { SchemaInspector } from 'knex-schema-inspector/lib/types/schema-inspector';
import { CustomError, DbConfig } from '@/common';
import log from 'electron-log';

export interface DbClient {
  exec(sql: string): Promise<any>;
  testConnect(config: DbConfig): Promise<boolean>;
  getVersion(): string | undefined;
  getTables(): Promise<string[]>;
  getPrimaryKey(tableName: string): Promise<string | number | null>;
  getColumns(): Promise<any[]>;
  getTableInfo(tableName: string): Promise<any[]>;
  getColumnsInfo(tableName: string): Promise<any[]>;
  getSchema(): Promise<{ tables: string[]; columns: any[] }>;
  showDatabases(): Promise<string[]>;
}

class SqlClient implements DbClient {
  public knex: Knex;

  private inspector: SchemaInspector;

  public client: Knex.Client;

  private version: string | undefined;

  constructor(config: DbConfig) {
    this.inspector = schemaInspector(knex(this.resolveConfig(config)));
    this.knex = this.inspector.knex;
    this.client = this.knex.client;
  }

  async showDatabases(): Promise<string[]> {
    const databases = await this.client.raw('SHOW DATABASES');
    return databases[0].map((item: any) => item.Database);
  }

  // eslint-disable-next-line class-methods-use-this
  resolveConfig(config: DbConfig) {
    const { client, user, password, port, host, database } = config;
    return {
      client,
      connection: {
        user,
        password,
        port,
        host,
        database,
      },
    };
  }

  initSchemaInspector(config: DbConfig, client: string) {
    this.inspector = schemaInspector(
      knex({
        client,
        connection: config,
      })
    );

    this.knex = this.inspector.knex;
  }

  getPrimaryKey(tableName: string): Promise<string | number | null> {
    return this.inspector?.primary(tableName);
  }

  getColumns(): Promise<any[]> {
    return this.inspector.columns();
  }

  getTableInfo(tableName: string): Promise<any> {
    return this.inspector.tableInfo(tableName);
  }

  getColumnsInfo(tableName: string): Promise<any[]> {
    return this.inspector.columns(tableName);
  }

  async getSchema(): Promise<{ tables: string[]; columns: any[] }> {
    const tables = await this.inspector.tables();
    const columns = await this.inspector.columnInfo();
    return {
      tables,
      columns,
    };
  }

  async getTables(): Promise<any[]> {
    const tables = await this.inspector.tables();
    return tables;
  }

  getVersion() {
    return this.version;
  }

  async testConnect() {
    try {
      await this.client.acquireConnection();
      return true;
    } catch (e) {
      log.error(e);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { code, errno, sqlState, sqlMessage, message } = e as any;
      throw new CustomError(message, code, errno, sqlState);
    }
  }

  async exec(sql: string): Promise<any> {
    const statements = identify(sql);
    const start = process.hrtime();
    const len = statements.length;
    const raws = [];
    for (let i = 0; i < len; i += 1) {
      raws.push(this.knex.raw(statements[i].text));
    }
    const result = await Promise.all(raws);
    const end = process.hrtime(start);
    const costTime = `${end[0] + end[1] / 1000_000_000}`;
    const lastStatement = statements.at(-1);
    if (lastStatement?.type === 'SELECT') {
      const columns = result.at(-1)[1].map((col: any) => {
        const { name, columnType, columnLength } = col;
        return {
          name,
          columnType,
          columnLength,
          title: name,
          dataIndex: name,
        };
      });
      return {
        result: {
          data: result.at(-1)[0],
          columns,
        },
        type: 'SELECT',
        costTime,
      };
    }
    return {
      type: lastStatement?.type,
      result,
      costTime,
    };
  }
}

export { SqlClient };
