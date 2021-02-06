/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import styles from './ResizableLayout.modules.less';

type GrabberWrapperProps = {
  childIdx: number,
  onResize: (childIdx: number, size: number) => void,
  isFirstPane?: boolean,
  size: number | undefined,
  direction: 'column' | 'row'
};

type GrabberWrapperState = {
  resizing: boolean
};

export default class GrabberWrapper extends React.Component<GrabberWrapperProps, GrabberWrapperState> {
  paneRef: React.RefObject<HTMLDivElement>

  grabberRef: React.RefObject<HTMLDivElement>

  constructor(props: GrabberWrapperProps) {
    super(props);

    this.state = {
      resizing: false,
    };

    this.paneRef = React.createRef();
    this.grabberRef = React.createRef();

    this.onMouseDown = this.onMouseDown.bind(this);
  }

  onMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (this.state.resizing) {
      return;
    }
    const { direction } = this.props;

    const topOrLeft = direction === 'column' ? 'top' : 'left';
    const offsetTopOrLeft = direction === 'column' ? 'offsetTop' : 'offsetLeft';
    const heightOrWidth = direction === 'column' ? 'height' : 'width';
    const clientYOrX = direction === 'column' ? 'clientY' : 'clientX';
    const bottomOrRight = direction === 'column' ? 'bottom' : 'right';

    this.setState({ resizing: true });
    e.currentTarget.style[topOrLeft] = `${e.currentTarget[offsetTopOrLeft]}px`;

    const mouseMoveHandler = (e: MouseEvent) => {
      e.preventDefault();
      const paneCurrent = this.paneRef.current;
      const grabberCurrent = this.grabberRef.current;
      if (this.state.resizing && grabberCurrent?.offsetParent && paneCurrent) {
        let grabberBounding = grabberCurrent.getBoundingClientRect();
        const halfGrabberSize = grabberBounding[heightOrWidth] / 2;
        grabberCurrent.style[topOrLeft] =
          `${e[clientYOrX] - grabberCurrent.offsetParent.getBoundingClientRect()[topOrLeft] - halfGrabberSize}px`;
        grabberBounding = grabberCurrent.getBoundingClientRect();
        const paneBounding = paneCurrent.getBoundingClientRect();
        this.props.onResize(this.props.childIdx, Math.max(0, paneBounding[bottomOrRight] - grabberBounding[topOrLeft]));
      }
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', () => {
      this.setState({
        resizing: false,
      });
      window.removeEventListener('mousemove', mouseMoveHandler);
      const grabberCurrent = this.grabberRef.current;
      if (grabberCurrent) {
        grabberCurrent.style[this.props.direction === 'column' ? 'top' : 'left'] = '';
      }
    }, { once: true });
  }

  render() {
    const { direction, isFirstPane, size } = this.props;

    const grabberStyle = {
      [direction === 'column' ? 'width' : 'height']: '100%',
      [direction === 'column' ? 'height' : 'width']: '5px',
      cursor: direction === 'column' ? 'ns-resize' : 'ew-resize',
    };

    return (
      <div
        ref={this.paneRef}
        className={styles.GrabberWrapper}
        style={{
          flexDirection: direction,
          [direction === 'column' ? 'height' : 'width']: size,
        }}
      >
        {
          !isFirstPane ? (
            <div
              ref={this.grabberRef}
              className={styles.grabber}
              style={grabberStyle}
              onMouseDown={this.onMouseDown}
            />
          ) :
            undefined
        }
        {this.props.children}
      </div>
    );
  }
}
