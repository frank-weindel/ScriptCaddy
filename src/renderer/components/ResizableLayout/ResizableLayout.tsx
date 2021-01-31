/* eslint-disable max-classes-per-file */
import React, { ReactElement } from 'react';
import ResizablePane from '../ResizablePane/ResizablePane';
import styles from './ResizableLayout.modules.less';

type GrabberWrapperProps = {
  childIdx: number,
  onResize: (childIdx: number, size: number) => void,
  isFirstPane?: boolean,
  size: number | undefined,
};

type GrabberWrapperState = {
  resizing: boolean
};

class GrabberWrapper extends React.Component<GrabberWrapperProps, GrabberWrapperState> {
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

    this.setState({ resizing: true });
    e.currentTarget.style.top = `${e.currentTarget.offsetTop}px`;

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
        this.props.onResize(this.props.childIdx, Math.max(0, paneBounding.bottom - grabberBounding.top));
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
        grabberCurrent.style.top = '';
      }
    }, { once: true });
  }

  render() {
    const { isFirstPane, size } = this.props;
    return (
      <div ref={this.paneRef} className={styles.GrabberWrapper} style={{ height: size }}>
        {
          !isFirstPane ?
            <div ref={this.grabberRef} className={styles.grabber} onMouseDown={this.onMouseDown} /> :
            undefined
        }
        {this.props.children}
      </div>
    );
  }
}

type ResizableLayoutProps = {
  children?: ReactElement[],
  onPaneResize?: (childIdx: number, size: number) => void,
};

type ResizableLayoutState = {
  sizes: Array<number | undefined>
};

export default class ResizableLayout extends React.Component<ResizableLayoutProps, ResizableLayoutState> {
  paneRef: React.RefObject<HTMLDivElement>

  wrapperRefs: React.RefObject<GrabberWrapper>[]

  constructor(props: ResizableLayoutProps) {
    super(props);

    this.state = {
      sizes: [],
    };

    this.paneRef = React.createRef();
    this.wrapperRefs = [];

    // this.onMouseDown = this.onMouseDown.bind(this);
    this.onPaneResize = this.onPaneResize.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
  }

  componentDidMount() {
    this.updateSizes();
    window.addEventListener('resize', this.onWindowResize);
  }

  componentDidUpdate() {
    if ((this.props.children || []).length !== this.state.sizes.length) {
      this.updateSizes();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  private onPaneResize(idx: number, size: number) {
    this.setState(prevState => {
      let diff = 0.0;
      const prevSize = prevState.sizes[idx];
      if (prevSize) {
        diff = size - prevSize;
      }

      return {
        sizes: prevState.sizes.map((sz, i) => {
          if (sz === undefined) {
            throw new Error('Expected sz to be defined');
          }
          if (idx - 1 === i) {
            // Pane before current one
            return Math.max(0, sz - diff);
          } else if (idx === i) {
            // Adjust size of current pane
            return size;
          }
          // Retain size of any other panes
          return sz;
        }),
      };
    });
    if (this.props.onPaneResize) {
      this.props.onPaneResize(idx, size);
    }
  }

  private onWindowResize() {
    this.updateSizes();
  }

  private updateSizes() {
    const sizes = this.state.sizes;
    const children = this.props.children || [];

    this.setState({
      sizes: children.map((_, i) => this.wrapperRefs[i].current?.paneRef.current?.getBoundingClientRect().height),
    });
  }

  render() {
    const { children = [] } = this.props;
    const { sizes } = this.state;
    this.wrapperRefs = children.map((_, i) => this.wrapperRefs[i] || React.createRef());

    return (
      <div className={styles.ResizableLayout}>
        {children.map((child: React.ReactElement, i: number) => (
          <GrabberWrapper ref={this.wrapperRefs[i]} childIdx={i} onResize={this.onPaneResize} isFirstPane={i === 0} size={sizes[i]}>
            {child.type === ResizablePane ?
              child :
              <ResizablePane>{child}</ResizablePane>
            }
          </GrabberWrapper>
        ))}
      </div>
    );
  }
}
