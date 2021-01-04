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
import { connect } from 'react-redux';
import AceEditor from 'react-ace';
import LabelBar from '../../components/LabelBar/LabelBar';
import {
  setScriptContent,
  openScript,
  saveScript,
} from '../../slices/scriptManager';

import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import styles from './CodeEditor.module.less';
import { AppDispatch, AppState } from '../../app/store';

type CodeEditorProps = {
  aceTheme: string,
  code: string,
  consoleOutput: string,
  setScriptContent: (string) => void,
};

class CodeEditor extends React.Component<CodeEditorProps> {
  static mapStateToProps(state: AppState) {
    return {
      code: state.scriptManager.scriptContent,
      scriptName: state.scriptManager.openedScriptName,
      consoleOutput: state.scriptManager.consoleOutput,
      aceTheme: state.theme.aceTheme,
    };
  }

  static mapDispatchToProps(dispatch: AppDispatch) {
    return {
      openScript: scriptName => dispatch(openScript(scriptName)),
      setScriptContent: content => dispatch(setScriptContent(content)),
      saveScript: () => dispatch(saveScript()),
    };
  }

  consoleRef: React.RefObject<AceEditor>

  constructor(props) {
    super(props);
    this.onCodeChange = this.onCodeChange.bind(this);
    this.consoleRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    // Whenever console output changes, scroll the console down to the last line
    if (prevProps.consoleOutput !== this.props.consoleOutput) {
      const numLines = this.consoleRef.current?.editor.session.getDocument().getAllLines().length || 0;
      this.consoleRef.current?.editor.gotoLine(numLines, 0, false);
    }
  }

  onCodeChange(code) {
    this.props.setScriptContent(code);
  }

  render() {
    const { aceTheme, code, consoleOutput } = this.props;

    return (
      <div className={styles.CodeEditor}>
        <AceEditor
          mode="javascript"
          theme={aceTheme}
          width="100%"
          height="100%"
          onChange={this.onCodeChange}
          value={code}
          setOptions={{ useWorker: false }}
        />
        <LabelBar>Console</LabelBar>
        <AceEditor
          mode="text"
          theme={aceTheme}
          width="100%"
          height="100%"
          readOnly
          value={consoleOutput}
          setOptions={{ useWorker: false }}
          ref={this.consoleRef}
        />
      </div>
    );
  }
}

export default connect(
  CodeEditor.mapStateToProps,
  CodeEditor.mapDispatchToProps
)(CodeEditor);
