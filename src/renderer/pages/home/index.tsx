import { Tabs } from '@arco-design/web-react';
import {
  IconHistory,
  IconStorage,
  IconSettings,
} from '@arco-design/web-react/icon';
import type { CSSProperties } from 'react';
import React, { useEffect, useState } from 'react';
import Setting from '../setting';
import Database from './components/Database';

import style from './index.module.less';

const { TabPane } = Tabs;

const iconStyle: CSSProperties = {
  fontSize: 22,
};
const paneStyle = {
  width: '100%',
  height: '100%',
};

const HomePage: React.FC = () => {
  const [active, setActive] = useState('storage');
  useEffect(() => {
    document.body.setAttribute('arco-theme', 'dark');
  }, []);

  const handleChange = (key: string) => {
    setActive(key);
  };

  return (
    <div className={style.Home}>
      <Tabs
        tabPosition="left"
        type="text"
        size="mini"
        activeTab={active}
        onChange={handleChange}
        style={{
          height: '100%',
        }}
      >
        <TabPane
          key="storage"
          style={paneStyle}
          title={<IconStorage style={iconStyle} />}
        >
          <Database />
        </TabPane>
        {/* <TabPane key="history" title={<IconHistory style={iconStyle} />} /> */}
        <TabPane key="setting" title={<IconSettings style={iconStyle} />}>
          <Setting />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default HomePage;
