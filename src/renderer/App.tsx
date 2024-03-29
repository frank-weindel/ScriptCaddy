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
// import PropTypes from 'prop-types';
// import logo from './logo.svg';
import { connect, ConnectedProps } from 'react-redux';
import classNames from 'classnames';
import ResizableLayout from './components/ResizableLayout/ResizableLayout';
import ResizablePane from './components/ResizablePane/ResizablePane';
import SideNav from './features/SideNav/SideNav';
import IOPage from './features/IOPage/IOPage';
import IOConfigPage from './features/IOConfigPage/IOConfigPage';
import Modal from './features/Modal/Modal';
import CodeEditor from './features/CodeEditor/CodeEditor';
import styles from './App.modules.less';
import {
  selectTab,
} from './slices/app';
import {
  runScript,
  saveScript,
  stopScript,
} from './slices/scriptManager';
import {
  AppDispatch,
  AppState,
} from './app/store';

window.api.receive('fromMain', data => {
  // eslint-disable-next-line no-console
  console.log(`Received ${data} from main process`);
});

class App extends React.Component<AppProps> {
  static mapStateToProps(state: AppState) {
    return {
      selectedTab: state.app.selectedTab,
      scriptRunning: state.scriptManager.running,
      codeDirty: state.scriptManager.scriptBodyDirty,
      configDirty: state.scriptManager.scriptConfigBodyDirty,
      configError: state.scriptManager.scriptConfigError,
    };
  }

  static mapDispatchToProps(dispatch: AppDispatch) {
    return {
      selectTab: (tab: string) => dispatch(selectTab(tab)),
      runScript: () => dispatch(runScript()),
      saveScript: () => dispatch(saveScript()),
      stopScript: () => dispatch(stopScript()),
    };
  }

  constructor(props: AppProps) {
    super(props);
    this.onClickTab = this.onClickTab.bind(this);
  }

  async onClickTab(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const { id } = e.currentTarget.dataset;
    if (id === 'run') {
      await this.props.saveScript();
      await this.props.runScript();
    } else if (id === 'stop') {
      await this.props.stopScript();
    } else if (id === 'save') {
      await this.props.saveScript();
    } else {
      this.props.selectTab(e.currentTarget.dataset.id || '');
    }
  }

  render() {
    const {
      codeDirty,
      configDirty,
      configError,
      selectedTab,
      scriptRunning,
    } = this.props;
    return (
      <div className={styles.App}>
        <ResizableLayout direction="row">
          <ResizablePane initialSize={300}>
            <SideNav />
          </ResizablePane>
          <ResizablePane>
            <div className={styles.contentContainer}>
              <div className={styles.tabBar}>
                <button
                  className={classNames(styles.tab, { [styles.activeTab]: selectedTab === 'code' })}
                  type="button"
                  data-id="code"
                  onClick={this.onClickTab}
                >
                  Code{codeDirty ? '*' : ''}
                </button>
                <button
                  className={classNames(styles.tab, { [styles.activeTab]: selectedTab === 'io' })}
                  type="button"
                  data-id="io"
                  onClick={this.onClickTab}
                >
                  I/O
                </button>
                <button
                  className={classNames(
                    styles.tab, {
                      [styles.activeTab]: selectedTab === 'io-config',
                      [styles.error]: configError,
                    }
                  )}
                  type="button"
                  data-id="io-config"
                  onClick={this.onClickTab}
                >
                  I/O Config{configDirty ? '*' : ''}
                </button>
                <button
                  className={styles.save}
                  type="button"
                  data-id="save"
                  onClick={this.onClickTab}
                >
                  Save
                </button>
                <button
                  className={styles.run}
                  type="button"
                  data-id={scriptRunning ? 'stop' : 'run'}
                  onClick={this.onClickTab}
                >
                  {scriptRunning ? 'Stop' : 'Run'}
                </button>
              </div>
              {selectedTab === 'code' && <CodeEditor />}
              {selectedTab === 'io' && <IOPage />}
              {selectedTab === 'io-config' && <IOConfigPage />}
            </div>
          </ResizablePane>
        </ResizableLayout>
        <Modal />
      </div>
    );
  }
}

const connector = connect(
  App.mapStateToProps,
  App.mapDispatchToProps
);

type AppProps = ConnectedProps<typeof connector>;

export default connector(App);
