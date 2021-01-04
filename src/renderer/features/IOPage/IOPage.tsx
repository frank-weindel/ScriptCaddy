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
import { connect } from 'react-redux';
import LabelBar from '../../components/LabelBar/LabelBar';
import {
  setInput,
  setOutput,
  getInputById,
  getOutputById,
} from '../../slices/scriptManager';
import styles from './IOPage.module.less';
import { AppDispatch, AppState } from '../../app/store';

type IOPageProps = {
  aceTheme: string,
  setInput: (inputId: number, value: string) => void,
  input1: string,
  input2: string,
  output1: string,
};

class IOPage extends React.Component<IOPageProps> {
  static mapStateToProps(state: AppState) {
    return {
      input1: getInputById(state, 1),
      input2: getInputById(state, 2),
      output1: getOutputById(state, 1),
      aceTheme: state.theme.aceTheme,
    };
  }

  static mapDispatchToProps(dispatch: AppDispatch) {
    return {
      setInput: (inputId, value) => dispatch(setInput({ inputId, value })),
      setOutput: (outputId, value) => dispatch(setOutput({ outputId, value })),
    };
  }

  render() {
    return (
      <div className={styles.IOPage}>
        <LabelBar>Input 1</LabelBar>
        <AceEditor
          mode="text"
          theme={this.props.aceTheme}
          width="100%"
          height="100%"
          value={this.props.input1}
          onChange={e => this.props.setInput(1, e)}
          setOptions={{ useWorker: false }}
        />
        <LabelBar>Input 2</LabelBar>
        <AceEditor
          mode="text"
          theme={this.props.aceTheme}
          width="100%"
          height="100%"
          value={this.props.input2}
          onChange={e => this.props.setInput(2, e)}
          setOptions={{ useWorker: false }}
        />
        <LabelBar>Output</LabelBar>
        <AceEditor
          mode="text"
          theme={this.props.aceTheme}
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

export default connect(
  IOPage.mapStateToProps,
  IOPage.mapDispatchToProps
)(IOPage);
