import {
  Table,
  ResizeBox,
  Message,
  Space,
  Button,
  Select,
} from '@arco-design/web-react';
import React, { memo, useRef, useState } from 'react';
import { MySQL } from '@codemirror/lang-sql';
import {
  IconCodeBlock,
  IconCopy,
  IconPlayArrow,
  IconSettings,
  IconSync,
} from '@arco-design/web-react/icon';
import type { ColumnType, SelectResult } from '@/common';
import { CodeEditor } from '@/components';

import { useAppStore } from '@/store';
import type { EditRef } from '@/components/CodeEditor';
import { useQueryReducer } from '@/reducer/query';
import { useTranslation } from 'react-i18next';

const { Option } = Select;
const ButtonGroup = Button.Group;

const transformSchema = (columns: ColumnType[], type = 'mysql') => {
  const SQLDialectMap: Record<string, any> = {
    mysql: MySQL,
  };

  const dialect = SQLDialectMap[type];
  const getSchema = (cols: ColumnType[]) => {
    const res: Record<string, any> = {};
    cols?.forEach((item) => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { table, name, comment, is_primary_key, max_length, data_type } =
        item;
      const tables = res[table] || [];
      tables.push({
        label: name,
        detail: `${is_primary_key ? 'primary, ' : ''}${data_type}(${
          max_length || ''
        })`,
        info: comment,
      });
      res[table] = tables;
    });
    return res;
  };

  return {
    dialect,
    schema: getSchema(columns),
    upperCaseKeywords: true,
  };
};

type QueryViewProps = {
  content?: string;
  connectionId?: string;
};

const QueryView: React.FC<QueryViewProps> = ({ content, connectionId }) => {
  const [state, dispatch] = useQueryReducer(content);
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(500);
  const store = useAppStore();
  const editRef = useRef<EditRef>(null);

  const fetchDatabases = async (id: string) => {
    try {
      const databases = (await window.electron.ipc.showDatabase(id)) ?? [];
      dispatch({ type: 'SET_DATABASE', payload: databases });
    } catch (e) {
      Message.error({
        closable: true,
        content: (e as Error).message,
        duration: 0,
      });
    }
  };

  const handleFormat = () => {
    const sql = editRef.current?.format();
    dispatch({ type: 'SET_CONTENT', payload: sql ?? '' });
  };

  const handleClickSync = async () => {
    if (!connectionId) {
      return;
    }
    const databases =
      (await window.electron.ipc.showDatabase(connectionId)) ?? [];
    console.log(databases);
  };

  const handleChangeConn = (id: any) => {
    dispatch({ type: 'SET_CURRENT_CONNECTION', payload: id });
    fetchDatabases(id);
  };

  const handleChangeDatabase = async (db: string) => {
    dispatch({ type: 'SET_CURRENT_DATABASE', payload: db });
    if (!(state.currentConn && db)) {
      return;
    }
    const { columns } = await window.electron.ipc.getSchema(
      state.currentConn,
      db
    );
    dispatch({ type: 'SET_SQL_CONFIG', payload: transformSchema(columns) });
  };

  const handleChange = (val: string) => {
    dispatch({ type: 'SET_CONTENT', payload: val });
  };

  const handleRun = async () => {
    const { currentDatabase, currentConn, content: sql } = state;
    if (!(currentConn && currentDatabase && sql)) {
      return;
    }
    try {
      const { type, result, costTime } = await window.electron.ipc.execQuery(
        currentConn,
        sql,
        currentDatabase
      );
      // eslint-disable-next-line no-console
      console.log(type, result, costTime);
      if (type === 'SELECT') {
        const { data, columns } = result as SelectResult;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = data.map((d: any) => {
          Object.keys(d).forEach((k) => {
            if (d[k] instanceof Date) {
              d[k] = d[k].toISOString();
            }
          });
          return {
            ...d,
          };
        });
        dispatch({ type: 'SET_TABLE_COLUMN', payload: columns });
        dispatch({ type: 'SET_TABLE_DATA', payload: res });
        dispatch({
          type: 'SET_TIME',
          payload: parseFloat(costTime).toFixed(4),
        });
      } else {
        const [res] = result as any;
        // eslint-disable-next-line no-unused-vars
        // affectedRows, changedRows, fieldCount, info, insertId, serverStatus, warningStatus
        const { info } = res;
        const columns = [
          { title: 'Query', dataIndex: 'query' },
          { title: 'Message', dataIndex: 'message' },
          { title: 'Time', dataIndex: 'costTime' },
        ];
        const data = [
          {
            id: 1,
            query: content,
            message: info,
            costTime: parseFloat(costTime).toFixed(4),
          },
        ];
        dispatch({ type: 'SET_TABLE_COLUMN', payload: columns });
        dispatch({ type: 'SET_TABLE_DATA', payload: data });
      }
      dispatch({ type: 'SET_QUERY_TYPE', payload: type });
    } catch (e) {
      console.log(e);
      Message.error({
        closable: true,
        content: (e as Error).message,
        duration: 0,
      });
    }
  };

  const renderBtnGroup = () => {
    const { connections } = store.state;
    return (
      <Space
        style={{
          flexWrap: 'wrap',
          rowGap: 4,
        }}
      >
        <ButtonGroup>
          <Button
            size="small"
            type="primary"
            icon={<IconPlayArrow />}
            onClick={handleRun}
            disabled={state.disabled}
          />
          <Button
            size="small"
            type="primary"
            onClick={handleFormat}
            icon={<IconCodeBlock />}
          />
          <Button size="small" type="primary" icon={<IconCopy />} />
          <Button size="small" type="primary" icon={<IconSettings />} />
        </ButtonGroup>
        <Select
          placeholder={t('connection.selectConn')}
          style={{ width: 240 }}
          onChange={handleChangeConn}
          defaultValue={state.currentConn}
          allowClear
          size="small"
          showSearch
        >
          {connections.map(
            (option) =>
              option.id && (
                <Option key={option.id} value={option.id}>
                  {option.title}
                </Option>
              )
          )}
        </Select>
        <Select
          placeholder={t('connection.selectDb')}
          allowClear
          showSearch
          size="small"
          style={{ width: 240 }}
          onChange={handleChangeDatabase}
        >
          {state.databases?.map((option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}
        </Select>
        {/* <Button size="small" icon={<IconSync />} onClick={handleClickSync}>
          刷新
        </Button> */}
      </Space>
    );
  };

  const panes = () => {
    return [
      <div key="CodeEditor-key">
        <CodeEditor
          ref={editRef}
          value={state.content}
          sqlConfig={state.sqlConfig}
          onChange={handleChange}
        />
      </div>,
      <Table
        key="table-key"
        style={{
          marginBottom: 10,
        }}
        columns={state.columns}
        data={state.tableDate}
        borderCell
        virtualized
        size="small"
        border={false}
        pagination={false}
        scroll={{
          y: scrollY,
        }}
        stripe
      />,
    ];
  };

  return (
    <>
      <div style={{ marginBottom: 10, paddingLeft: 8 }}>{renderBtnGroup()}</div>
      <ResizeBox.Split
        className="query-view"
        direction="vertical"
        style={{ height: 'calc(100vh - 64px)' }}
        max={0.8}
        min={0.2}
        onPaneResize={(container) => {
          setScrollY(container[1].clientHeight - 100);
        }}
        panes={panes()}
      />
      <div
        style={{
          padding: '0 8px',
          position: 'absolute',
          bottom: 0,
          height: 30,
          width: '100%',
          lineHeight: '30px',
          textAlign: 'right',
          borderTop: '1px solid #5c5c5c',
          color: '#fbfbfb',
          zIndex: 2,
          background: 'var(--color-bg-1)',
        }}
      >
        <span style={{ marginRight: 18 }}>
          {state.queryType === 'SELECT' &&
            (state.tableDate === undefined || state.tableDate == null
              ? ''
              : `${t('connection.total')}：${state?.tableDate.length} ${t(
                  'connection.row'
                )}`)}
        </span>
        <span>
          {state.costTime === undefined || state.costTime == null
            ? ''
            : `${t('connection.castTime')}：${state.costTime.substring(
                0,
                8
              )} ${t('connection.second')}`}
        </span>
      </div>
    </>
  );
};

export default memo(QueryView);
