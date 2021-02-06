/* eslint-disable max-classes-per-file */
import React, { ReactElement } from 'react';
import GrabberWrapper from './GrabberWrapper';
import ResizablePane from '../ResizablePane/ResizablePane';
import styles from './ResizableLayout.modules.less';

type ResizableLayoutProps = {
  children?: ReactElement[],
  onPaneResize?: (childIdx: number, size: number) => void,
  direction: 'column' | 'row'
};

type ResizableLayoutState = {
  layoutSize: number,
  sizes: Array<number | undefined>
};

export default class ResizableLayout extends React.Component<ResizableLayoutProps, ResizableLayoutState> {
  layoutRef: React.RefObject<HTMLDivElement>

  paneRef: React.RefObject<HTMLDivElement>

  wrapperRefs: React.RefObject<GrabberWrapper>[]

  resizeObserver: ResizeObserver;

  static defaultProps = {
    direction: 'column',
  };

  constructor(props: ResizableLayoutProps) {
    super(props);

    this.state = {
      sizes: [],
    };

    this.paneRef = React.createRef();
    this.layoutRef = React.createRef();
    this.wrapperRefs = [];

    this.onLayoutResize = this.onLayoutResize.bind(this);
    this.onPaneResize = this.onPaneResize.bind(this);

    this.resizeObserver = new ResizeObserver(this.onLayoutResize);
  }

  componentDidMount() {
    if (!this.layoutRef.current) {
      throw new Error('Expected layoutRef to be defined');
    }
    this.resizeObserver.observe(this.layoutRef.current);
    this.updateSizes();
  }

  componentDidUpdate() {
    if ((this.props.children || []).length !== this.state.sizes.length) {
      this.updateSizes();
    }
  }

  componentWillUnmount() {
    if (!this.layoutRef.current) {
      throw new Error('Expected layoutRef to be defined');
    }
    this.resizeObserver.unobserve(this.layoutRef.current);
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

  private onLayoutResize() {
    this.updateSizes();
  }

  private updateSizes() {
    const { children = [], direction } = this.props;
    const { sizes, layoutSize } = this.state;
    const heightOrWidth = direction === 'column' ? 'height' : 'width';
    const newLayoutSize = this.layoutRef.current?.getBoundingClientRect()[heightOrWidth] || 0.0;
    const deltaRatio = newLayoutSize / layoutSize;

    this.setState({
      sizes: children.map(
        (_, i) => deltaRatio * (sizes[i] || this.wrapperRefs[i].current?.paneRef.current?.getBoundingClientRect()[heightOrWidth] || 0.0)
      ),
      layoutSize: newLayoutSize,
    });
  }

  render() {
    const { children = [], direction } = this.props;
    const { sizes } = this.state;
    this.wrapperRefs = children.map((_, i) => this.wrapperRefs[i] || React.createRef());

    return (
      <div ref={this.layoutRef} className={styles.ResizableLayout} style={{ flexDirection: direction }}>
        {children.map((child: React.ReactElement, i: number) => (
          <GrabberWrapper
            ref={this.wrapperRefs[i]}
            childIdx={i}
            direction={direction}
            onResize={this.onPaneResize}
            isFirstPane={i === 0}
            size={sizes[i]}
          >
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
