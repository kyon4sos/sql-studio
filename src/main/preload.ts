import { contextBridge } from 'electron';

import { ipc } from '@/preload';

export type Channels = 'ipc-example';
// contextBridge.exposeInMainWorld()
contextBridge.exposeInMainWorld('electron', {
  ipc,
  // ipcRenderer: {
  //   sendMessage(channel: Channels, args: unknown[]) {
  //     ipcRenderer.send(channel, args);
  //   },
  //   on(channel: Channels, func: (...args: unknown[]) => void) {
  //     const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
  //       func(...args);
  //     ipcRenderer.on(channel, subscription);
  //     return () => {
  //       ipcRenderer.removeListener(channel, subscription);
  //     };
  //   },
  //   once(channel: Channels, func: (...args: unknown[]) => void) {
  //     ipcRenderer.once(channel, (_event, ...args) => func(...args));
  //   },
  // },
});
