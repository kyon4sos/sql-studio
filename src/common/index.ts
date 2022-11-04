import { IpcMainInvokeEvent } from 'electron';
import type { StatementType } from 'sql-query-identifier';

export const IpcEvent = {
  showDatabases: 'showDatabases',
  testConnect: 'testConnect',
  saveConnection: 'saveConnection',
  connections: 'connections',
  schema: 'schema',
  tabs: 'tabs',
  execSql: 'execSql',
  tables: 'tables',
};

export interface DbConfig {
  id?: string;
  title: string;
  client: string;
  connectionLimit?: number;
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  createDate?: string;
}

export type TabType = {
  id: string;
  title: string;
  content?: string;
  columns?: ColumnType[];
  tableData?: unknown[];
  connectionId?: string;
  database?: string;
  type: 'query' | 'data' | 'designTable';
};

export type Column = {
  name: string;
  columnType: string;
  columnLength: number;
  title: string;
  dataIndex: string;
};

export type ColumnType = {
  table: string;
  name: string;
  data_type: string;
  max_length: number;
  is_primary_key: boolean;
  comment: string;
  id?: string | number;
};

export type Result = {
  code: string | number;
  message: string;
  data: unknown;
  success: boolean;
  errno: number | string;
};

type Select = {
  columns: Column[];
  data: Record<string, any>[];
};

export interface SQLResult<T extends BaseResult> {
  type: StatementType;
  result: T;
  costTime: string;
}

// eslint-disable-next-line  @typescript-eslint/no-empty-interface
export interface BaseResult {}

export interface SelectResult extends BaseResult {
  data: unknown[];
  columns: Column[];
}

export interface ModifyResult extends BaseResult {
  effectRows: number;
}

export type SqlHandler<T extends StatementType, R> = (
  sql: string
) => Promise<{ type: T; data: R }>;

export type UpdateHandler = (sql: string) => SqlHandler<'SELECT', Select>;

export type HandlerExec = (
  sql: string
) => Promise<{ type: 'SELECT'; data: unknown }>;

export interface Handler<T> {
  get: () => T[] | null | undefined;
  create: (data: T) => Promise<boolean> | boolean | void;
  update: (data: T) => Promise<number> | void;
  delete: (id: string) => Promise<number> | void;
  [index: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventHandler<T = any> = (
  e: IpcMainInvokeEvent,
  data: { type: string; payload: T }
) => Promise<unknown> | void;

export type Action<T> =
  | { type: 'connection'; data: T }
  | { type: 'tab'; data: T };

export type RequestType<T = any> = {
  type?: MethodType;
  payload?: T | string;
  url?: string;
};

export class CustomError extends Error {
  code: string;

  errno: string;

  sqlState: string;

  constructor(message: string, code: string, errno: string, sqlState: string) {
    super(message);
    this.code = code;
    this.errno = errno;
    this.sqlState = sqlState;
  }
}

export type MethodType = 'get' | 'put' | 'post' | 'delete';
