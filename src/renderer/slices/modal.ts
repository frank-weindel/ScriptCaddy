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

export enum ModalType {
  PROMPT = 'PROMPT',
  CONFIRM = 'CONFIRM',
}

export type ModalResult = boolean | null | string;

let modalResolve: null | ((value: string | boolean | PromiseLike<ModalResult> | null) => void) = null;

export const modal = createSlice({
  name: 'modal',
  initialState: {
    isOpen: false,
    type: undefined,
    data: {
      message: '',
    },
  },
  reducers: {
    openModal(state, action) {
      state.isOpen = true;
      state.type = action.payload.type;
      state.data = action.payload.data;
    },
    closeModal(state) {
      state.isOpen = false;
    },
  },
});

// const {
// } = modal.actions;

export const { openModal, closeModal } = modal.actions;

export default modal.reducer;

export function promptModal(message) {
  return async dispatch => {
    dispatch(openModal({ type: ModalType.PROMPT, data: { message } }));
    return new Promise<ModalResult>(resolve => {
      modalResolve = resolve;
    });
  };
}

export function confirmModal(message) {
  return async dispatch => {
    dispatch(openModal({ type: ModalType.CONFIRM, data: { message } }));
    return new Promise<ModalResult>(resolve => {
      modalResolve = resolve;
    });
  };
}

export function resolveModal(result: ModalResult) {
  return dispatch => {
    dispatch(closeModal());
    if (modalResolve) {
      modalResolve(result);
      modalResolve = null;
    }
  };
}
