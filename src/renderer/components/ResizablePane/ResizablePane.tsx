import React, { useState } from 'react';
// import PropTypes from 'prop-types';
import styles from './ResizablePane.modules.less';

type ResizablePaneState = {
  size: number | undefined,
  resizing: boolean
};

export default class ResizablePane extends React.Component<{}, ResizablePaneState> {
  paneRef: React.RefObject<HTMLDivElement>

  grabberRef: React.RefObject<HTMLDivElement>

  constructor(props: {}) {
    super(props);

    this.state = {
      size: undefined,
      resizing: false,
    };

    this.paneRef = React.createRef();
    this.grabberRef = React.createRef();

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  onMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (this.state.resizing === false) {
      this.setState({ resizing: true });
      e.currentTarget.style.top = `${e.currentTarget.offsetTop}px`;
    }

    const mouseMoveHandler = (e: MouseEvent) => {
      e.preventDefault();
      const paneCurrent = this.paneRef.current;
      const grabberCurrent = this.grabberRef.current;
      if (this.state.resizing && grabberCurrent?.offsetParent && paneCurrent) {
        let grabberBounding = grabberCurrent.getBoundingClientRect();
        const halfGrabberHeight = grabberBounding.height / 2;
        grabberCurrent.style.top = `${e.clientY - grabberCurrent.offsetParent.getBoundingClientRect().top - halfGrabberHeight}px`;
        grabberBounding = grabberCurrent.getBoundingClientRect();
        const paneBounding = paneCurrent.getBoundingClientRect();
        paneCurrent.style.height = `${paneBounding.bottom - grabberBounding.top}px`;
      }
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', () => {
      this.setState({
        resizing: false,
        size: this.paneRef.current?.clientHeight || undefined,
      });
      window.removeEventListener('mousemove', mouseMoveHandler);
    }, { once: true });
  }

  onMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const paneCurrent = this.paneRef.current;
    if (this.state.resizing && e.currentTarget.offsetParent && paneCurrent) {
      let grabberBounding = e.currentTarget.getBoundingClientRect();
      const halfGrabberHeight = grabberBounding.height / 2;
      e.currentTarget.style.top = `${e.clientY - e.currentTarget.offsetParent.getBoundingClientRect().top - halfGrabberHeight}px`;
      grabberBounding = e.currentTarget.getBoundingClientRect();
      const paneBounding = paneCurrent.getBoundingClientRect();
      paneCurrent.style.height = `${paneBounding.bottom - grabberBounding.top}px`;
    }
  }

  render() {
    const { children } = this.props;
    const { size } = this.state;
    return (
      <div ref={this.paneRef} className={styles.ResizablePane} style={{ height: size }}>
        <div ref={this.grabberRef} onMouseDown={this.onMouseDown} className={styles.grabber} />
        {children}
      </div>
    );
  }
}
