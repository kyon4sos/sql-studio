import { app } from 'electron';
import { join } from 'path';

const AppIsPackaged = app.isPackaged;

const RESOURCES_PATH = AppIsPackaged
  ? join(process.resourcesPath, 'assets')
  : join(__dirname, '../../assets');

const getControllerDir = () =>
  AppIsPackaged ? join(__dirname, 'main.js') : join(__dirname, '../controller');

const getDataBaseFile = () =>
  AppIsPackaged
    ? join(process.resourcesPath, 'assets', 'database.sqlite')
    : join(RESOURCES_PATH, '../../assets/database.sqlite');

export { getControllerDir, AppIsPackaged, RESOURCES_PATH, getDataBaseFile };
