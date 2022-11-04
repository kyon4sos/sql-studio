import React, { useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import type { ColumnType, DbConfig, TabType } from '@/common';
import { NTree } from '@/components';
import type { NodePropsType } from '@/pages/home/components/Tree';
import NewConnection, { ConnectionRef } from '../NewConnection';
import Editor from '../Editor';

import style from './index.module.less';

const Database: React.FC = () => {
  const [defaultSelectedKeys] = useState('');
  const columnsRef = useRef<Record<string, ColumnType[]>>({});
  const tabRef = useRef<TabType>();
  const ref = useRef<ConnectionRef>(null);
  const handleAddTab = (
    type: TabType['type'] = 'query',
    data?: ColumnType[] | string
  ) => {
    const newTab: TabType = {
      title: 'New Tab ',
      id: nanoid(),
      type,
    };

    if (typeof data === 'string') {
      newTab.content = data;
    } else if (Array.isArray(data)) {
      newTab.columns = data;
    }

    tabRef.current = newTab;
  };

  const handleMenuItemClick = (key: string, node: NodePropsType) => {
    console.log(key, node, columnsRef);
    const { database = '', table = '' } = node;
    const data = columnsRef.current[database].filter((d) => d.table === table);

    const typeMap: Record<string, { type: TabType['type']; data: unknown }> = {
      '1': { type: 'query', data: '' },
      '2': {
        type: 'designTable',
        data,
      },
    };
    handleAddTab(typeMap[key].type, data);
  };
  const handleClickEdit = (data: unknown) => {
    ref.current?.edit(data as DbConfig);
  };
  return (
    <div className={style.Main}>
      <div style={{ marginTop: 8, width: 320 }}>
        <NewConnection ref={ref} />
        <NTree
          onMenuItemClick={handleMenuItemClick}
          defaultSelectedKeys={[defaultSelectedKeys]}
          onClickEdit={handleClickEdit}
        />
      </div>
      <Editor tab={tabRef.current} />
    </div>
  );
};

export default Database;
