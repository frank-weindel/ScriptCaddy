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
import classNames from 'classnames';
import styles from './SideNav.module.less';
import {
  selectScripts,
  openScript,
  newScript,
  openScriptFileManager,
} from '../../slices/scriptManager';
import { AppDispatch, AppState } from '../../app/store';

class SideNav extends React.Component<SideNavProps> {
  static mapStateToProps(state: AppState) {
    return {
      scripts: selectScripts(state),
      openedScriptName: state.scriptManager.openedScriptName,
    };
  }

  static mapDispatchToProps(dispatch: AppDispatch) {
    return {
      openScript: (scriptName: string) => dispatch(openScript(scriptName)),
      newScript: () => dispatch(newScript()),
      openScriptFileManager: (scriptName: string) => dispatch(openScriptFileManager(scriptName)),
    };
  }

  constructor(props: SideNavProps, context: string) {
    super(props, context);
    this.onClickAdd = this.onClickAdd.bind(this);
  }

  async onClickAdd() {
    await this.props.newScript();
  }

  render() {
    const {
      scripts, openedScriptName, openScript, openScriptFileManager,
    } = this.props;
    const list = scripts.map((script: string) => ({
      title: script,
      subtitle: '',
    }));

    return (
      <div className={styles.SideNav}>
        {list.map((item, i) => (
          <div
            key={item.title}
            className={classNames(styles['SideNav-item'], item.title === openedScriptName && styles.selected)}
            tabIndex={i + 1}
            role="menuitem"
            onClick={() => openScript(item.title)}
            onKeyPress={() => openScript(item.title)}
          >
            <div className={styles['SideNav-item-title']}>{item.title}</div>
            <button type="button" className={styles['SideNav-item-info']} onClick={() => openScriptFileManager(item.title)}>?</button>
          </div>
        ))}
        <div className={styles.bottomBar}>
          <button className={styles.addButton} type="button" data-id="add" onClick={this.onClickAdd}>+</button>
        </div>
      </div>
    );
  }
}

const connector = connect(
  SideNav.mapStateToProps,
  SideNav.mapDispatchToProps
);

type SideNavProps = ConnectedProps<typeof connector>;

export default connector(SideNav);
