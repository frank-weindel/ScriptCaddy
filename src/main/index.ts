/**
 * Copyright (C) 2020 Frank Weindel
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// Modules to control application life and create native browser window
import {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  nativeTheme,
  MenuItemConstructorOptions,
} from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { Message } from '../common/RendererApis';

// eslint-disable-next-line no-console
console.log('Starting ScriptCaddy');

const isMac = process.platform === 'darwin';

nativeTheme.themeSource = 'light';

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
    webPreferences: {
      contextIsolation: true,
      // webSecurity: false,
      preload: path.resolve(__dirname, '../preload/preload.js'),
    },
  });

  const macAppMenu: MenuItemConstructorOptions = { role: 'appMenu' };
  const helpMenu: MenuItemConstructorOptions = {
    role: 'help',
    submenu: [
      {
        label: 'About',
        click: async () => {
          mainWindow.webContents.send('launchAbout', []);
        },
      },
    ],
  };
  const themeMenu: MenuItemConstructorOptions = {
    label: 'Theme',
    submenu: [
      {
        label: 'Light',
        click: async () => {
          mainWindow.webContents.send('setTheme', 'light');
        },
      },
      {
        label: 'Dark',
        click: async () => {
          mainWindow.webContents.send('setTheme', 'dark');
        },
      },
    ],
  };

  const template: MenuItemConstructorOptions[] = [
    ...(isMac ? [macAppMenu] : []),
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    themeMenu,
    helpMenu,
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadURL(
    isDev ?
      'http://localhost:3000' :
      `file://${path.resolve(__dirname, '../renderer/index.html')}`
  );

  ipcMain.on('toMain', (_event, args: Message) => {
    if (args.msg === 'onInitComplete') {
      // Initialize the theme and then show the window finally
      mainWindow.webContents.send('setTheme', 'dark');
      mainWindow.show();
    } else if (args.msg === 'onThemeChange') {
      nativeTheme.themeSource = args.themeSource;
    }
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This allows refreshes on renderer to re-run the preload script
app.allowRendererProcessReuse = false;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  /*
    Install Extensions
  */
  // BrowserWindow.addDevToolsExtension(
  //   path.resolve(__dirname, '../../extensions/ReactDevTools_4.7.0_0')
  // );
  // BrowserWindow.addDevToolsExtension(
  //   path.resolve(__dirname, '../../extensions/ReduxDevTools_2.17.0_0')
  // );

  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});
