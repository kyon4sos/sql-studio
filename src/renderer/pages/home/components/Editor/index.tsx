import { Table, Tabs } from '@arco-design/web-react';
import React, { useReducer, useState } from 'react';
import { IconPlusCircle } from '@arco-design/web-react/icon';
import { nanoid } from 'nanoid';
import type { ColumnType, TabType } from '@/common';
import DesignView from '../DesignView';
import QueryView from '../QueyView';

import style from './index.module.less';

const { TabPane } = Tabs;

let count = 1;

const initTabs: TabType[] = [...new Array(count)].map((_, i) => ({
  title: `Tab ${i + 1}`,
  id: nanoid(),
  content: 'select * from world',
  type: 'query',
}));

const paneStyle = {
  width: '100%',
  height: '100%',
};

export type Connection = {
  title: string;
  key: string;
};

type EditorPropsType = {
  activeTab?: string;
  tab?: TabType;
  onAddTab?: () => void;
  onDeleteTab?: (id: string) => void;
  onChangeTab?: (id: string) => void;
  onEditColumn?: (data: any) => void;
};

const initialState = {
  currentConn: '',
  currentTable: '',
  activeTab: initTabs[0].id,
  defaultActiveTab: initTabs[0].id,
  tabs: initTabs,
  databases: [] as string[],
  tables: [] as string[],
  columns: [] as ColumnType[],
  visible: false,
};

type ActionType =
  | { type: 'SET_CURRENT_TABLE'; payload: string }
  | { type: 'SET_VISIBLE'; payload: boolean }
  | { type: 'SET_TABLES'; payload: string[] }
  | { type: 'SET_DATABASES'; payload: string[] }
  | { type: 'SET_COLUMNS'; payload: ColumnType[] }
  | { type: 'SET_TABS'; payload: typeof initTabs }
  | { type: 'SET_ACTIVE_TAB'; payload: string };

const reducer = (
  state: typeof initialState,
  action: ActionType
): typeof initialState => {
  const { type, payload } = action;
  switch (type) {
    case 'SET_TABS':
      return {
        ...state,
        tabs: payload,
      };
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: payload,
      };
    case 'SET_DATABASES': {
      return {
        ...state,
        databases: action.payload,
      };
    }
    case 'SET_CURRENT_TABLE': {
      return {
        ...state,
        currentTable: action.payload,
      };
    }
    case 'SET_VISIBLE': {
      return {
        ...state,
        visible: action.payload,
      };
    }
    case 'SET_TABLES': {
      return {
        ...state,
        tables: action.payload,
      };
    }
    case 'SET_COLUMNS': {
      return {
        ...state,
        columns: action.payload,
      };
    }
    default:
      return initialState;
  }
};

const Editor: React.FC<EditorPropsType> = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [defaultActiveTab] = useState('');

  const renderContent = (tab: TabType) => {
    const { type, id, content, connectionId, database } = tab;
    switch (type) {
      case 'designTable':
        return (
          <DesignView
            connectionId={connectionId}
            database={database}
            columns={tab.columns}
          />
        );
      case 'data':
        return <Table />;
      case 'query':
        return (
          <QueryView
            id={id}
            content={content}
            connectionId={connectionId}
            database={database}
          />
        );
      default:
        return <h1 style={{ color: '#fff' }}>视图暂未实现</h1>;
    }
  };

  const handleAddTab = (
    type: TabType['type'] = 'query',
    data?: ColumnType[] | string
  ) => {
    const newTab: TabType = {
      title: `New Tab ${(count += 1)}`,
      id: nanoid(),
      type,
    };

    if (typeof data === 'string') {
      newTab.content = data;
    } else if (Array.isArray(data)) {
      newTab.columns = data;
    }

    dispatch({ type: 'SET_TABS', payload: [...state.tabs, newTab] });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: newTab.id! });
    window.electron.ipc.createTab({
      tab: newTab,
      connectionId: state.currentConn,
    });
  };
  const handleChangeTab = (payload: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload });
  };

  const handleDeleteTab = (id: string) => {
    const { tabs } = state;
    const { activeTab } = state;
    const index = tabs.findIndex((x) => x.id === id);
    const newTabs = tabs.slice(0, index).concat(tabs.slice(index + 1));

    if (id === activeTab && index > -1 && newTabs.length) {
      dispatch({
        type: 'SET_ACTIVE_TAB',
        payload: newTabs[index] ? newTabs[index].id! : newTabs[index - 1].id!,
      });
    }

    if (index > -1) {
      dispatch({ type: 'SET_TABS', payload: newTabs });
    }
    window.electron.ipc.deleteTab(state.currentConn, id);
  };

  return (
    <div className={style.Editor}>
      <Tabs
        editable
        activeTab={state.activeTab}
        onAddTab={handleAddTab}
        onDeleteTab={handleDeleteTab}
        onChange={handleChangeTab}
        defaultActiveTab={defaultActiveTab}
        type="card-gutter"
        addButton={
          <IconPlusCircle style={{ color: '#ababab', fontSize: 18 }} />
        }
        style={{ height: '100%' }}
      >
        {state.tabs.map((tab) => {
          const { id, title } = tab;
          return (
            <TabPane
              // destroyOnHide
              key={id}
              title={title}
              style={paneStyle}
            >
              {renderContent(tab)}
            </TabPane>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Editor;
