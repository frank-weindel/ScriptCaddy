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
import { configureStore } from '@reduxjs/toolkit';
import { batchedSubscribe, NotifyFunction } from 'redux-batched-subscribe';
import debounce from 'lodash/debounce';
import appReducer from '../slices/app';
import modalReducer from '../slices/modal';
import scriptManagerReducer from '../slices/scriptManager';
import themeReducer from '../slices/theme';

const debounceNotify = debounce((notify: NotifyFunction) => notify());

const store = configureStore({
  reducer: {
    app: appReducer,
    scriptManager: scriptManagerReducer,
    modal: modalReducer,
    theme: themeReducer,
  },
  // Whenever actions are dispatched in succession in the same frame, we want to wait
  // to notify React to update in the very next frame.
  // Very important in certain areas like scriptManager where we do this a lot.
  enhancers: [
    batchedSubscribe(debounceNotify),
  ],
});

export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;
export default store;
