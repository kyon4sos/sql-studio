import type { ForwardedRef } from 'react';
import React, { forwardRef, useCallback, useImperativeHandle } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { SQLConfig } from '@codemirror/lang-sql';
import { sql } from '@codemirror/lang-sql';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { format as _format } from 'sql-formatter';

export interface CodeEditorPropsType {
  value?: string;
  sqlConfig?: SQLConfig;
  ref: ForwardedRef<{ format: FormatHandle }>;
  onChange?: (val: string) => void;
}

type FormatHandle = () => string;

export type EditRef = {
  format: FormatHandle;
};

const CodeEditor: React.FC<CodeEditorPropsType> = ({
  value: sqlString,
  sqlConfig,
  onChange: _onChange,
  ref,
}) => {
  const onChange = useCallback(
    (content: string) => {
      _onChange && _onChange(content);
    },
    [_onChange]
  );

  useImperativeHandle(ref, () => ({
    format: () => {
      return _format(sqlString ?? '');
    },
  }));

  return (
    <CodeMirror
      value={sqlString}
      extensions={[sql(sqlConfig)]}
      onChange={onChange}
      theme={dracula}
    />
  );
};

const CodeEditorRef = forwardRef<EditRef, CodeEditorPropsType>((props, ref) =>
  CodeEditor({ ...props, ref })
);
CodeEditorRef.displayName = 'CodeEditorRef';
export default CodeEditorRef;
