import type { PropsWithChildren, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import style from './index.module.less';

interface ContextMenuPropsType {
  onClick?: (menu: string) => void;
  menus: string[];
  children?: ReactNode | HTMLElement | ReactNode[];
}

const ContextMenu: React.FC<PropsWithChildren<ContextMenuPropsType>> = ({
  menus,
  children,
  onClick,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [position] = useState<{ x: number; y: number }>();
  const [visible, setVisible] = useState(false);
  const menusRef = useRef([...menus, '取消']);

  const onClickItem = (menu: any) => {
    onClick && onClick(menu);
    setVisible(false);
  };

  const renderMenu = () => {
    if (!visible) return null;
    return (
      <div
        className={style.contextMenu}
        style={{
          position: 'absolute',
          left: position?.x,
          top: position?.y,
          zIndex: 2,
        }}
      >
        {menusRef.current.map((m) => (
          <div
            onClick={() => onClickItem(m)}
            onKeyDown={() => onClickItem(m)}
            className={style.menuItem}
            key={m}
            tabIndex={0}
            role="button"
          >
            {m}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={wrapperRef}>
      {renderMenu()}
      <div>{children}</div>
    </div>
  );
};

export default ContextMenu;
