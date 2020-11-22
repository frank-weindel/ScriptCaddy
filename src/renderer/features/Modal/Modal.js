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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  resolveModal,
  MODAL_TYPES,
} from '../../slices/modal';
import styles from './Modal.module.less';

class Modal extends React.Component {
  static mapStateToProps(state) {
    return {
      isOpen: state.modal.isOpen,
      type: state.modal.type,
      data: state.modal.data,
    };
  }

  static mapDispatchToProps(dispatch) {
    return {
      resolveModal: result => dispatch(resolveModal(result)),
    };
  }

  constructor(props) {
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

  componentDidUpdate(prevProps, _prevState, _snapshot) {
    // When modal is opening. Focus on the text box.
    if (!prevProps.isOpen && this.props.isOpen && this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyPress, false);
  }

  onKeyPress(e) {
    if (e.key === 'Escape' && this.props.isOpen) {
      this.onCancel();
    }
  }

  onOk() {
    this.props.resolveModal(this.inputRef.current.value);
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
    if (type === MODAL_TYPES.PROMPT) {
      buttons = (
        <form>
          <input ref={this.inputRef} type="text" />
          <button type="submit" onClick={this.onOk}>OK</button>
          <button type="button" onClick={this.onCancel}>Cancel</button>
        </form>
      );
    } else if (type === MODAL_TYPES.CONFIRM) {
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

Modal.propTypes = {
  resolveModal: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  type: PropTypes.bool.isRequired,
  data: PropTypes.objectOf({
    message: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect(
  Modal.mapStateToProps,
  Modal.mapDispatchToProps
)(Modal);
