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
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from './app/store';
import themeManager from './themeManager';
import {
  refreshScripts,
  consoleLog,
  consoleLogRaw,
  setOutput,
} from './slices/scriptManager';
import { confirmModal } from './slices/modal';
import { setThemeVars } from './slices/theme';

import './index.less';

(async () => {
  // eslint-disable-next-line no-console
  console.log('Initializing API...');
  await window.myAPI.init();
  // eslint-disable-next-line no-console
  console.log('Initialized.');

  window.addEventListener('message', event => {
    if (event.data.evt === 'update') {
      store.dispatch(refreshScripts());
    } else if (event.data.evt === 'stdout' || event.data.evt === 'stderr') {
      store.dispatch(consoleLogRaw(event.data.data));
    } else if (event.data.evt === 'final') {
      store.dispatch(consoleLog(JSON.stringify(event.data)));
      store.dispatch(
        setOutput({ outputId: 1, value: typeof event.data.output === 'object' ? JSON.stringify(event.data.output) : event.data.output })
      );
    }
  }, false);

  window.store = store;

  window.launchAbout = () => {
    store.dispatch(confirmModal('ScriptCaddy Copyright 2020 Frank Weindel'));
  };

  window.myAPI.on('launchAbout', () => {
    window.launchAbout();
  });

  window.myAPI.on('setTheme', (event, theme) => {
    themeManager.setTheme(theme);
  });

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );

  store.dispatch(refreshScripts());

  themeManager.setTheme('light');
  themeManager.onThemeLoad = computedStyles => {
    store.dispatch(setThemeVars({
      aceTheme: computedStyles.getPropertyValue('--ace-theme').trim(),
    }));
  };
})();
