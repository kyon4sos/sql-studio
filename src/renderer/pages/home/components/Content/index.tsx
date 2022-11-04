import { Table } from '@arco-design/web-react';
import React, { useEffect, useState, useCallback } from 'react';

import type { TabType } from '@/common';
import DesignView from '../DesignView';
import QueryView from '../QueyView';

export interface MainContentProps {
  tab: TabType;
  onChange?: (data: any) => void;
  tableData?: unknown[];
}

const MainContent: React.FC<MainContentProps> = ({
  tab,
  onChange: _onChange,
  tableData,
}) => {
  const [data] = useState(tableData);
  const { type, id, content, connectionId } = tab;

  const change = useCallback(
    (_data: any) => {
      return _onChange && _onChange(_data);
    },
    [_onChange]
  );

  useEffect(() => {
    change(data);
  }, [change, data]);

  const render = () => {
    switch (type) {
      case 'designTable':
        return <DesignView />;
      case 'data':
        return <Table />;
      case 'query':
        return (
          <QueryView id={id} content={content} connectionId={connectionId} />
        );
      default:
        return <></>;
    }
  };

  return <>{render()}</>;
};

export default MainContent;
