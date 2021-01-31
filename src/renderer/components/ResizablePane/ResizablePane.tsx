import React, { useState } from 'react';
// import PropTypes from 'prop-types';
import styles from './ResizablePane.modules.less';

type ResizablePaneState = {
  size: number | undefined
};

export default class ResizablePane extends React.Component<{}, ResizablePaneState> {
  paneRef: React.RefObject<HTMLDivElement>

  grabberRef: React.RefObject<HTMLDivElement>

  constructor(props: {}) {
    super(props);

    this.state = {
      size: undefined,
    };

    this.paneRef = React.createRef();
    this.grabberRef = React.createRef();
  }

  render() {
    const { children } = this.props;
    const { size } = this.state;
    return (
      <div ref={this.paneRef} className={styles.ResizablePane} style={{ height: size }}>
        {children}
      </div>
    );
  }
}
