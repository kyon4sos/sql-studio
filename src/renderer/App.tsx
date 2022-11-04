import React, { useMemo, useReducer } from 'react';
import { AppContext, initState, reducer } from './store';
import HomePage from './pages/home';
import '@arco-design/web-react/dist/css/arco.css';
import './index.css';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initState);
  const contextValue = useMemo(() => {
    return { state, dispatch };
  }, [state, dispatch]);
  return (
    <AppContext.Provider value={contextValue}>
      <HomePage />
    </AppContext.Provider>
  );
};

export default App;
