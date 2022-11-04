import type { DbConfig } from '@/common';
import type { Dispatch, ReactNode } from 'react';
import React, { useReducer, useContext } from 'react';

export type IAppContext = {
  state: IAppState;
  dispatch: Dispatch<Action>;
};

export interface IAppState {
  connections: DbConfig[];
}

export type Action = { type: 'SET_CONNECTIONS'; payload: DbConfig[] };

export const AppContext = React.createContext<IAppContext>({} as IAppContext);

export const initState = {
  connections: [] as DbConfig[],
};

export function reducer(
  state: typeof initState,
  action: Action
): typeof initState {
  const { payload, type } = action;

  switch (type) {
    case 'SET_CONNECTIONS': {
      return {
        ...state,
        connections: [...payload],
      };
    }
    default:
      return initState;
  }
}

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  return useContext(AppContext);
};
