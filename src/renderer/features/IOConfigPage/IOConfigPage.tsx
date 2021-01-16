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
  setIOConfig,
  getIOConfigText,
} from '../../slices/scriptManager';
import styles from './IOConfigPage.module.less';
import { AppDispatch, AppState } from '../../app/store';

function mapStateToProps(state: AppState) {
  return {
    ioConfig: getIOConfigText(state),
    aceTheme: state.theme.aceTheme,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    setIOConfig: (value: string) => dispatch(setIOConfig({ value })),
  };
}

class IOConfigPage extends React.Component<IOConfigPageProps> {
  render() {
    return (
      <div className={styles.IOConfigPage}>
        <LabelBar>IO Config</LabelBar>
        <AceEditor
          mode="text"
          theme={this.props.aceTheme}
          width="100%"
          height="100%"
          value={this.props.ioConfig}
          onChange={e => this.props.setIOConfig(e)}
          setOptions={{ useWorker: false }}
        />
      </div>
    );
  }
}

const connector = connect(
  mapStateToProps,
  mapDispatchToProps
);

type IOConfigPageProps = ConnectedProps<typeof connector>;

export default connector(IOConfigPage);
