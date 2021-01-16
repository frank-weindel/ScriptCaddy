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
import { connect, ConnectedProps } from 'react-redux';
import {
  resolveModal,
  ModalType,
  ModalResult,
} from '../../slices/modal';
import styles from './Modal.module.less';
import { AppDispatch, AppState } from '../../app/store';

class Modal extends React.Component<ModalProps> {
  static mapStateToProps(state: AppState) {
    return {
      isOpen: state.modal.isOpen,
      type: state.modal.type,
      data: state.modal.data,
    };
  }

  static mapDispatchToProps(dispatch: AppDispatch) {
    return {
      resolveModal: (result: ModalResult) => dispatch(resolveModal(result)),
    };
  }

  inputRef: React.RefObject<HTMLInputElement>

  constructor(props: ModalProps) {
    super(props);
    this.onOk = this.onOk.bind(this);
    this.onYes = this.onYes.bind(this);
    this.onNo = this.onNo.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyPress, false);
  }

  componentDidUpdate(prevProps: ModalProps) {
    // When modal is opening. Focus on the text box.
    if (!prevProps.isOpen && this.props.isOpen && this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyPress, false);
  }

  onKeyPress(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.props.isOpen) {
      this.onCancel();
    }
  }

  onOk() {
    this.props.resolveModal(this.inputRef.current?.value || '');
  }

  onYes() {
    this.props.resolveModal(true);
  }

  onNo() {
    this.props.resolveModal(false);
  }

  onCancel() {
    this.props.resolveModal(null);
  }

  getForm() {
    const { type } = this.props;

    let buttons;
    if (type === ModalType.PROMPT) {
      buttons = (
        <form>
          <input ref={this.inputRef} type="text" />
          <button type="submit" onClick={this.onOk}>OK</button>
          <button type="button" onClick={this.onCancel}>Cancel</button>
        </form>
      );
    } else if (type === ModalType.CONFIRM) {
      buttons = (
        <form>
          <button type="submit" onClick={this.onYes}>Yes</button>
          <button type="submit" onClick={this.onNo}>No</button>
          <button type="button" onClick={this.onCancel}>Cancel</button>
        </form>
      );
    }
    return buttons;
  }

  render() {
    const { isOpen, data } = this.props;

    return isOpen && (
      <div className={styles.modalContainer}>
        <div className={styles.modal}>
          <div className={styles.contents}>
            <div>{data.message}</div>
            {this.getForm()}
          </div>
        </div>
      </div>
    );
  }
}

const connector = connect(
  Modal.mapStateToProps,
  Modal.mapDispatchToProps
);

type ModalProps = ConnectedProps<typeof connector>;

export default connector(Modal);
