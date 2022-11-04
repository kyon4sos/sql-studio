import { IPC } from '@/preload';

declare global {
  interface Electron {
    ipc: IPC;
  }
  interface Window {
    ipc: IPC;
    electron: {
      ipc: IPC;
    };
  }
}
