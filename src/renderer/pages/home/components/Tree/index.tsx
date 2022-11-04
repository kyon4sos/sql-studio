import type { ColumnType, DbConfig } from '@/common';
import { useAppStore } from '@/store';
import { Dropdown, Menu, Tree } from '@arco-design/web-react';
import type {
  NodeInstance,
  NodeProps,
  TreeDataType,
} from '@arco-design/web-react/es/Tree/interface';
import {
  IconEdit,
  IconEye,
  IconFontColors,
  IconNav,
  IconStorage,
} from '@arco-design/web-react/icon';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClickAway } from 'react-use';

export type NodePropsType = {
  connectionId: string;
  database?: string;
  key: string;
  title: string;
  table?: string;
  type: 'database' | 'table' | 'column';
} & TreeDataType;

type NodeType = TreeDataType & {
  type?: 'connection' | 'database' | 'table';
  connectionId?: string;
  database?: string;
  table?: string;
  children?: NodeType[];
};

interface TreePropsType {
  onClickEdit: (data: unknown) => void;
  defaultSelectedKeys: string[];
  onMenuItemClick?: (key: string, node: NodePropsType) => void;
}

const iconStyle = {
  marginRight: 8,
  fontSize: 16,
  transform: 'translateY(1px)',
};

const NTree: React.FC<TreePropsType> = ({
  defaultSelectedKeys,
  onMenuItemClick,
  onClickEdit,
}) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [conns, setConns] = useState<DbConfig[]>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { t } = useTranslation();
  const { dispatch } = useAppStore();
  const ref = useRef(null);
  const store = useAppStore();
  const currentRef = useRef<NodePropsType>();
  const columnsRef = useRef<Record<string, ColumnType[]>>({});

  useClickAway(ref, () => {
    setPopupVisible(false);
  });

  useEffect(() => {
    setConns(store.state.connections);
  }, [store.state.connections]);

  useEffect(() => {
    const fetch = async () => {
      const res = (await window.electron.ipc.getConnections()) ?? [];
      const payload = res.map((conn) => ({
        ...conn,
        key: conn.id,
        type: 'connection',
        connectionId: conn.id,
      }));
      dispatch({ type: 'SET_CONNECTIONS', payload });
      setConns(payload);
    };
    fetch();
  }, [dispatch]);

  const loadMore = async (treeNode: NodeInstance): Promise<void> => {
    const key = (title: string) => {
      return `${treeNode.props.dataRef?.key}||${title}`;
    };

    const { connectionId, type, database, table } = treeNode.props
      .dataRef as unknown as NodeType;

    if (!connectionId || !database) {
      return;
    }
    if (type === 'connection') {
      const res = (await window.electron.ipc.showDatabase(connectionId)) ?? [];
      if (treeNode.props && treeNode.props.dataRef) {
        treeNode.props.dataRef.children = res.map((item: string) => {
          return {
            title: item,
            key: key(item),
            isLeaf: false,
            type: 'database',
            icon: <IconStorage />,
            connectionId,
            database: item,
          };
        });
      }
    }

    if (type === 'database') {
      const res = await window.electron.ipc.getSchema(connectionId, database);
      if (!res) {
        return;
      }
      const { tables, columns } = res;
      if (tables && columns && treeNode.props && treeNode.props.dataRef) {
        treeNode.props.dataRef.children = tables.map((item: string) => ({
          title: item,
          key: key(item),
          isLeaf: false,
          icon: <IconNav />,
          type: 'table',
          table: item,
          database,
          connectionId,
        }));
      }
      columnsRef.current[database] = columns;
    }
    if (type === 'table' && connectionId) {
      if (treeNode.props && treeNode.props.dataRef) {
        treeNode.props.dataRef.children = columnsRef.current[database]
          .filter((item) => item.table === table)
          .map((item) => ({
            title: item.name,
            key: key(item.name),
            isLeaf: true,
            icon: <IconFontColors />,
            type: 'column',
            connectionId,
          }));
      }
    }
    setConns([...conns]);
  };

  const handleSelect = (selectedKeys: string[], extra: any) => {
    console.log(selectedKeys, extra);
  };

  const onMouseDown = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    node?: TreeDataType
  ) => {
    const { pageX, pageY } = e;
    setPosition({ x: pageX, y: pageY });
    setPopupVisible(true);
    currentRef.current = node as NodePropsType;
  };

  const handleClickMenu = (key: string) => {
    currentRef.current &&
      onMenuItemClick &&
      onMenuItemClick(key, currentRef.current);
    setPopupVisible(false);
  };

  const handleClickEdit = (data: TreeDataType | undefined) => {
    data && onClickEdit && onClickEdit(data);
  };

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <div className="NTree">
        <Dropdown
          triggerProps={{
            style: {
              position: 'absolute',
              top: `${position.y}px`,
              left: `${position.x}px`,
            },
          }}
          trigger="contextMenu"
          position="bl"
          popupVisible={popupVisible}
          droplist={
            <Menu
              ref={ref}
              onClickMenuItem={handleClickMenu}
              style={{
                width: 140,
              }}
            >
              <Menu.Item key="1">
                <IconEye style={iconStyle} />
                {t('connection.viewDate')}
              </Menu.Item>
              <Menu.Item key="2">
                <IconEdit style={iconStyle} />
                {t('connection.viewTable')}
              </Menu.Item>
            </Menu>
          }
        />
      </div>
      <Tree
        defaultSelectedKeys={defaultSelectedKeys}
        loadMore={loadMore}
        treeData={conns}
        onSelect={handleSelect}
        renderExtra={(node) => {
          return (node.dataRef as NodeType).type === 'connection' ? (
            <div
              style={{
                marginLeft: 10,
                verticalAlign: 'bottom',
              }}
            >
              <IconEdit
                style={{ fontSize: 12, verticalAlign: 'bottom' }}
                onClick={() => {
                  handleClickEdit(node.dataRef);
                }}
              />
            </div>
          ) : null;
        }}
        renderTitle={(props: NodeProps) => {
          return (
            <span onContextMenu={(e) => onMouseDown(e, props?.dataRef)}>
              {props?.title}
            </span>
          );
        }}
      />
    </div>
  );
};

export default NTree;
