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
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './IOPage.module.less';
import {
  setInput,
  setOutput,
  getInputById,
  getOutputById,
} from '../../slices/scriptManager';

class IOPage extends React.Component {
  static mapStateToProps(state) {
    return {
      input1: getInputById(state, 1),
      input2: getInputById(state, 2),
      output1: getOutputById(state, 1),
    };
  }

  static mapDispatchToProps(dispatch) {
    return {
      setInput: (inputId, value) => dispatch(setInput({ inputId, value })),
      setOutput: (outputId, value) => dispatch(setOutput({ outputId, value })),
    };
  }

  render() {
    return (
      <div className={styles.IOPage}>
        <div className={styles.ioLabel}>Input 1</div>
        <AceEditor
          mode="text"
          theme="github"
          width="100%"
          height="100%"
          value={this.props.input1}
          onChange={e => this.props.setInput(1, e)}
          setOptions={{ useWorker: false }}
        />
        <div className={styles.ioLabel}>Input 2</div>
        <AceEditor
          mode="text"
          theme="github"
          width="100%"
          height="100%"
          value={this.props.input2}
          onChange={e => this.props.setInput(2, e)}
          setOptions={{ useWorker: false }}
        />
        <div className={styles.ioLabel}>Output</div>
        <AceEditor
          mode="text"
          theme="github"
          width="100%"
          height="100%"
          readOnly
          value={this.props.output1}
          setOptions={{ useWorker: false }}
        />
      </div>
    );
  }
}

IOPage.propTypes = {
  setInput: PropTypes.func.isRequired,
  input1: PropTypes.string.isRequired,
  input2: PropTypes.string.isRequired,
  output1: PropTypes.string.isRequired,
};

export default connect(
  IOPage.mapStateToProps,
  IOPage.mapDispatchToProps
)(IOPage);
