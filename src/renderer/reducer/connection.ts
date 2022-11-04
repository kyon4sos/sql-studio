import { DbConfig } from '@/common';
import { BaseButtonProps } from '@arco-design/web-react/es/Button/interface';
import { useReducer } from 'react';

const formInitValue = {
  title: 'new connection',
  user: 'root',
  password: '123456',
  host: 'localhost',
  port: 3306,
  client: 'mysql2',
  savePassword: true,
  database: '',
};

const initialState = {
  status: 'default' as BaseButtonProps['status'],
  text: '测试连接',
  title: '新建链接',
  loading: false,
  visible: false,
  mode: 'create' as ModeType,
  formValue: formInitValue,
};

type ModeType = 'create' | 'edit';

type InitialStateType = typeof initialState;

type Action =
  | { type: 'testing' }
  | { type: 'error' }
  | { type: 'create' }
  | { type: 'success' }
  | { type: 'reset' }
  | { type: 'edit'; payload: DbConfig & { savePassword: boolean } }
  | { type: 'initial' };

const reducer = (state: InitialStateType, action: Action): InitialStateType => {
  const { type } = action;
  switch (type) {
    case 'testing':
      return {
        ...state,
        loading: true,
        text: '测试连接...',
        status: 'default',
      };

    case 'error':
      return {
        ...state,
        loading: false,
        text: '连接错误',
        status: 'danger',
      };
    case 'success':
      return {
        ...state,
        loading: false,
        text: '连接成功',
        status: 'success',
      };
    case 'initial':
      return {
        ...state,
        loading: false,
        visible: false,
        text: '测试连接',
        status: 'default',
      };
    case 'reset':
      return {
        ...state,
        loading: false,
        text: '测试连接',
        status: 'default',
      };
    case 'edit':
      return {
        ...state,
        visible: true,
        loading: false,
        text: '测试连接',
        title: '编辑链接',
        status: 'default',
        formValue: action.payload,
      };
    case 'create':
      return {
        ...state,
        visible: true,
        loading: false,
        text: '测试连接',
        title: '新建链接',
        status: 'default',
      };
    default:
      return initialState;
  }
};

const useConnectionReducer = () => {
  return useReducer(reducer, initialState);
};

export { useConnectionReducer };
