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
import ResizableAceEditor from '../../components/ResizableAceEditor/ResizableAceEditor';
import LabelBar from '../../components/LabelBar/LabelBar';
import {
  setIOValue,
  getInputs,
  getOutputs,
  getScriptConfig,
  IOFieldSetValue,
} from '../../slices/scriptManager';
import styles from './IOPage.module.less';
import { AppDispatch, AppState } from '../../app/store';
import ResizableLayout from '../../components/ResizableLayout/ResizableLayout';
import ResizablePane from '../../components/ResizablePane/ResizablePane';

function mapStateToProps(state: AppState) {
  // const ioConfig =
  return {
    ioConfig: getScriptConfig(state),
    inputs: getInputs(state),
    outputs: getOutputs(state),
    aceTheme: state.theme.aceTheme,
    scriptName: state.scriptManager.openedScriptName,
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
      scriptName,
      setIOValue,
    } = this.props;
    return (
      <div className={styles.IOPage}>
        <ResizableLayout key={`IOPage-${scriptName}`} memoryKey={`IOPage-${scriptName}`}>
          {this.props.ioConfig.map(element => (
            <ResizablePane key={`${element.type}_${element.id}`}>
              <LabelBar>{element.label}</LabelBar>
              <ResizableAceEditor
                mode="text"
                theme={this.props.aceTheme}
                width="100%"
                height="100%"
                value={element.type === 'input' ? inputs[element.id] : outputs[element.id]}
                readOnly={element.type === 'output'}
                onChange={value => setIOValue({ element, value })}
                setOptions={{ useWorker: false }}
              />
            </ResizablePane>
          ))}
        </ResizableLayout>
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
