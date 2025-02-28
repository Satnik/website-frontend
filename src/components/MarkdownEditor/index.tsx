import React from 'react';
import Editor, { IToolbar } from 'for-editor-dark';

interface IMarkdownEditorProps {
  value: string;
  handleChange(value?: string): void;
}

const toolbar: IToolbar = {
  h1: true,
  h2: true,
  h3: true,
  h4: true,
  h5: true,
  h6: true,
  bold: true,
  italic: true,
  underline: true,
  strikethrough: true,
  img: true,
  link: true,
  code: true,
  preview: true,
  expand: true,
  undo: true,
  redo: true,
  save: false,
  subfield: true,
};

export default ({ value, handleChange }: IMarkdownEditorProps): JSX.Element => (
  <Editor
    value={value}
    onChange={handleChange}
    height="300px"
    language="en"
    placeholder="Module Description"
    toolbar={toolbar}
  />
);
