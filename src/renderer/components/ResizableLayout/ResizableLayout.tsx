/* eslint-disable max-classes-per-file */
import React, { ReactElement } from 'react';
import StateMemory from '../../lib/StateMemory';
import GrabberWrapper from './GrabberWrapper';
import { ResizablePaneProps } from '../ResizablePane/ResizablePane';
import styles from './ResizableLayout.modules.less';

type ResizableLayoutProps = {
  children?: ReactElement<ResizablePaneProps>[],
  memoryKey?: string,
  onPaneResize?: (childIdx: number, size: number) => void,
  direction: 'column' | 'row'
};

type ResizableLayoutState = {
  layoutSize: number | undefined,
  sizes: Array<number | undefined>
};

const memory = new StateMemory<ResizableLayoutState>();

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

    this.state = memory.hookToComponent(this, props.memoryKey, {
      sizes: [],
      layoutSize: undefined,
    });

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

    this.resetSizes();
  }

  componentDidUpdate() {
    if ((this.props.children || []).length !== this.state.sizes.length) {
      this.resetSizes();
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

  private resetSizes() {
    const { children, direction } = this.props;
    const { sizes } = this.state;
    if (children) {
      const heightOrWidth = direction === 'column' ? 'height' : 'width';
      const newLayoutSize = this.layoutRef.current?.getBoundingClientRect()[heightOrWidth] || 0.0;
      let remainingLayoutSize = newLayoutSize;

      /**
       * Number of panes that use an automatic initial size
       */
      let numAutoSizePanes = 0;
      const fixedSizes = children?.map((child, i) => {
        const initialSize = child.props.initialSize || sizes[i];
        if (initialSize !== undefined) {
          remainingLayoutSize -= initialSize;
          return initialSize;
        }
        numAutoSizePanes++;
        return undefined;
      });
      // Do this to make sure we fill the entire layout size in case fixedSizes do not fill it!
      // TODO: Possibly do this in a more controllable fashion / more advanced things
      const lastFixedSize = fixedSizes[fixedSizes.length - 1];
      if (numAutoSizePanes === 0 && remainingLayoutSize > 0 && lastFixedSize) {
        remainingLayoutSize += lastFixedSize;
        fixedSizes[fixedSizes.length - 1] = undefined;
        numAutoSizePanes++;
      }
      const newSizes = fixedSizes.map(size => {
        //
        if (size !== undefined) {
          return size;
        }
        return remainingLayoutSize / numAutoSizePanes;
      });
      this.setState({
        sizes: newSizes,
        layoutSize: newLayoutSize,
      });
    }
  }

  private updateSizes() {
    const { children = [], direction } = this.props;
    const { sizes, layoutSize } = this.state;
    const heightOrWidth = direction === 'column' ? 'height' : 'width';
    const newLayoutSize = this.layoutRef.current?.getBoundingClientRect()[heightOrWidth] || 0.0;
    const deltaRatio = layoutSize ? newLayoutSize / layoutSize : 1;

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
    let grabberPos = 0;
    return (
      <div ref={this.layoutRef} className={styles.ResizableLayout} style={{ flexDirection: direction }}>
        {children.map((child, i: number) => {
          const position = grabberPos;
          grabberPos += sizes[i] || 0;
          return (
            <GrabberWrapper
              ref={this.wrapperRefs[i]}
              childIdx={i}
              direction={direction}
              onResize={this.onPaneResize}
              isFirstPane={i === 0}
              position={position}
              size={sizes[i]}
            >
              {child}
            </GrabberWrapper>
          );
        })}
      </div>
    );
  }
}
