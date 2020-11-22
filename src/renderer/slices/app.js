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
import { createSlice } from '@reduxjs/toolkit';

export const app = createSlice({
  name: 'app',
  initialState: {
    selectedTab: 'code',
  },
  reducers: {
    selectTab: (state, action) => {
      state.selectedTab = action.payload;
    },
  },
});

export const selectScripts = state => state.app.scripts;

export const { selectTab } = app.actions;

export default app.reducer;
