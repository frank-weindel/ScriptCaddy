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
  setIOValue,
} from './slices/scriptManager';
import { confirmModal } from './slices/modal';
import { setThemeVars } from './slices/theme';

import './index.less';

(async () => {
  // eslint-disable-next-line no-console
  console.log('Initializing API...');
  const result = await window.myAPI.init('/Users/fweind200/.nodenv/shims/node');
  // eslint-disable-next-line no-console
  console.log('Initialized.', result);

  window.myAPI.on('scriptEvent', (event, data) => {
    if (data.evt === 'update') {
      store.dispatch(refreshScripts());
    } else if (data.evt === 'error') {
      store.dispatch(consoleLog(data));
    } else if (data.evt === 'stdout' || data.evt === 'stderr') {
      store.dispatch(consoleLogRaw(data.data));
    } else if (data.evt === 'final') {
      const outputs = data.outputs;
      const outputIds = Object.keys(data.outputs);
      store.dispatch(consoleLog(JSON.stringify(data)));
      outputIds.forEach(id => {
        store.dispatch(
          setIOValue({
            element: {
              type: 'output',
              label: '',
              id,
            },
            value: outputs[id],
          })
        );
      });
    }
  });

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

  themeManager.onThemeLoad = computedStyles => {
    const vars = {
      themeSource: computedStyles.getPropertyValue('--theme-source').trim() || 'light',
      aceTheme: computedStyles.getPropertyValue('--ace-theme').trim(),
    };
    store.dispatch(setThemeVars(vars));
    if (vars.themeSource === 'dark' || vars.themeSource === 'light') {
      window.api.send('toMain', { msg: 'onThemeChange', themeSource: vars.themeSource });
    }
  };

  window.api.send('toMain', { msg: 'onInitComplete' });
})();
