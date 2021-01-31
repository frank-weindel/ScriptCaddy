/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';

/**
 * A wrapper of AceEditor that responds appropriately to DOM resize events
 */
export default class ResizableAceEditor extends React.Component<IAceEditorProps> {
  editorRef: React.RefObject<AceEditor>

  resizeObserver: ResizeObserver;

  constructor(props: IAceEditorProps) {
    super(props);
    this.editorRef = React.createRef();
    this.onResize = this.onResize.bind(this);
    this.resizeObserver = new ResizeObserver(this.onResize);
  }

  componentDidMount() {
    if (!this.editorRef.current) {
      throw new Error('Expected editorRef to be defined');
    }
    this.resizeObserver.observe(this.editorRef.current.refEditor);
  }

  componentWillUnmount() {
    if (!this.editorRef.current) {
      throw new Error('Expected editorRef to be defined');
    }
    this.resizeObserver.unobserve(this.editorRef.current.refEditor);
  }

  onResize() {
    this.editorRef.current?.editor.resize();
  }

  get editor() {
    return this.editorRef.current?.editor;
  }

  render() {
    return (
      <AceEditor
        ref={this.editorRef}
        {...this.props}
      />
    );
  }
}
