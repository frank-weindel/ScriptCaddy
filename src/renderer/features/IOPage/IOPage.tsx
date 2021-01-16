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
import { connect, ConnectedProps } from 'react-redux';
import LabelBar from '../../components/LabelBar/LabelBar';
import {
  setIOValue,
  getInputs,
  getOutputs,
  getIOConfig,
  IOFieldSetValue,
} from '../../slices/scriptManager';
import styles from './IOPage.module.less';
import { AppDispatch, AppState } from '../../app/store';

function mapStateToProps(state: AppState) {
  // const ioConfig =
  return {
    ioConfig: getIOConfig(state),
    inputs: getInputs(state),
    outputs: getOutputs(state),
    aceTheme: state.theme.aceTheme,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    setIOValue: (value: IOFieldSetValue) => dispatch(setIOValue(value)),
  };
}

class IOPage extends React.Component<IOPageProps> {
  render() {
    const {
      inputs,
      outputs,
      setIOValue,
    } = this.props;
    return (
      <div className={styles.IOPage}>
        {this.props.ioConfig.map(element => (
          <React.Fragment key={`${element.type}_${element.id}`}>
            <LabelBar>{element.label}</LabelBar>
            <AceEditor
              mode="text"
              theme={this.props.aceTheme}
              width="100%"
              height="100%"
              value={element.type === 'input' ? inputs[element.id] : outputs[element.id]}
              readOnly={element.type === 'output'}
              onChange={value => setIOValue({ element, value })}
              setOptions={{ useWorker: false }}
            />
          </React.Fragment>
        ))}

        {/* <LabelBar>Input 1</LabelBar>
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
        /> */}
      </div>
    );
  }
}

const connector = connect(
  mapStateToProps,
  mapDispatchToProps
);

type IOPageProps = ConnectedProps<typeof connector>;

export default connector(IOPage);
