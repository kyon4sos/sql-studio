import { useReducer } from 'react';

const initialState = {
  currentConn: '',
  currentDatabase: '',
  databases: [] as string[],
  columns: [] as any[],
  sqlConfig: {} as any,
  disabled: true,
};

type InitialStateType = typeof initialState & {
  costTime?: null | string;
  tableDate?: any[];
  content?: string;
  queryType?: string;
};

type Action =
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_CURRENT_CONNECTION'; payload: string }
  | { type: 'SET_CURRENT_DATABASE'; payload: string }
  | { type: 'SET_DATABASE'; payload: string[] }
  | { type: 'SET_SQL_CONFIG'; payload: unknown }
  | { type: 'SET_TABLE_DATA'; payload: unknown[] }
  | { type: 'SET_TIME'; payload: string | null }
  | { type: 'SET_QUERY_TYPE'; payload: string }
  | { type: 'SET_TABLE_COLUMN'; payload: unknown[] };

const reducer = (
  state: typeof initialState,
  action: Action
): InitialStateType => {
  const { type, payload } = action;
  switch (type) {
    case 'SET_CONTENT':
      return {
        ...state,
        content: payload,
      };
    case 'SET_SQL_CONFIG':
      return {
        ...state,
        sqlConfig: payload,
      };
    case 'SET_DATABASE':
      return {
        ...state,
        databases: payload,
      };
    case 'SET_TABLE_DATA':
      return {
        ...state,
        tableDate: payload,
      };
    case 'SET_TABLE_COLUMN':
      return {
        ...state,
        columns: payload,
      };
    case 'SET_CURRENT_CONNECTION':
      return {
        ...state,
        currentConn: payload,
      };
    case 'SET_CURRENT_DATABASE':
      return {
        ...state,
        currentDatabase: payload,
        disabled: false,
      };
    case 'SET_TIME':
      return {
        ...state,
        costTime: payload,
      };
    case 'SET_QUERY_TYPE':
      return {
        ...state,
        queryType: payload,
      };
    default:
      return initialState;
  }
};

const useQueryReducer = (content?: string) => {
  return useReducer(reducer, { ...initialState, content });
};

export { useQueryReducer };
