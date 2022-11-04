import { ipcRenderer } from 'electron';
import type {
  DbConfig,
  ColumnType,
  TabType,
  SQLResult,
  BaseResult,
  RequestType,
} from '@/common';

import { IpcEvent } from '@/common';
import { Message } from '@arco-design/web-react';

function Emit<T>(
  event: keyof typeof IpcEvent,
  action: RequestType<T>
): Promise<any>;

async function Emit<T = any>(
  event: keyof typeof IpcEvent,
  action: RequestType<T>
) {
  try {
    return await ipcRenderer.invoke(IpcEvent[event], action);
  } catch (e) {
    Message.error((e as Error).message);
  }
}

const ipc = {
  testConnect: (config: DbConfig) =>
    Emit('testConnect', { type: 'get', payload: config }),

  showDatabase: (connectionId: string): Promise<string[]> =>
    Emit('connections', {
      type: 'get',
      url: 'showDatabase',
      payload: connectionId,
    }),

  execQuery: (
    connectionId: string,
    sqlString: string,
    db: string
  ): Promise<SQLResult<BaseResult>> =>
    Emit('execSql', {
      type: 'get',
      payload: {
        sqlString,
        connectionId,
        db,
      },
    }),

  getConnections: (): Promise<DbConfig[]> =>
    Emit('connections', { type: 'get' }),

  createConnection: (config: DbConfig): Promise<boolean> =>
    Emit('connections', { type: 'post', payload: config }),

  saveConnection: (config: DbConfig): Promise<boolean> =>
    Emit('connections', { type: 'post', payload: config }),

  getTables: (connectionId: string) =>
    Emit('execSql', { type: 'get', url: 'getTables', payload: connectionId }),

  getTabs: () => Emit('tabs', { type: 'get' }),

  createTab: (data: { tab: TabType; connectionId: string }): Promise<boolean> =>
    Emit('tabs', {
      type: 'post',
      payload: data,
    }),

  deleteTab: (connectionId: string, id: string): Promise<boolean> =>
    Emit('tabs', { type: 'delete', payload: { id, connectionId } }),

  getSchema: (
    connectionId: string,
    db?: string
  ): Promise<{ tables: string[]; columns: ColumnType[] }> =>
    Emit('execSql', {
      type: 'get',
      url: 'schema',
      payload: { connectionId, db },
    }),
};
export { Emit, ipc };

export type IPC = typeof ipc;
