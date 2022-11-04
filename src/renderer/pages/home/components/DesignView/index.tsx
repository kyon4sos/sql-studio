import type { ColumnType } from '@/common';
import {
  InputNumber,
  Checkbox,
  Table,
  Space,
  Button,
  Select,
  Input,
} from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { IconPlus, IconSync } from '@arco-design/web-react/icon';
import type { SQLConfig } from '@codemirror/lang-sql';
import { nanoid } from 'nanoid';
import React, { memo, useEffect, useState } from 'react';

const { Option } = Select;

const columnTypeOpts = [
  'bigint',
  'binary',
  'bit',
  'blob',
  'char',
  'date',
  'datetime',
  'decimal',
  'double',
  'float',
  'int',
  'integer',
  'json',
  'longblob',
  'longtext',
  'timestamp',
  'tinyint',
  'tinytext',
  'varchar',
];

const transform = (columns?: ColumnType[]): ColumnType[] => {
  if (!columns) {
    return [];
  }
  return columns.map((col) => ({
    ...col,
    id: nanoid(),
  }));
};

type DesignViewPropsType = {
  database?: string;
  connectionId?: string;
  columns?: ColumnType[];
};

const DesignView: React.FC<DesignViewPropsType> = ({
  columns,
  connectionId,
  database,
}) => {
  const [sqlString, setSqlString] = useState('');
  const [columnData, setColumnData] = useState(transform(columns));
  const [tableData, setTableData] = useState();
  const [sqlConfig, setSqlConfig] = useState<SQLConfig>();

  console.log(
    connectionId,
    database,
    sqlString,
    setSqlString,
    tableData,
    setTableData,
    sqlConfig,
    setSqlConfig
  );

  const transformColumnToData = (cols?: ColumnType[]): ColumnType[] => {
    return cols || [];
  };

  useEffect(() => {
    console.log(columnData);
  }, [columnData]);

  const onChangeColumn = (
    col: string,
    item: any,
    index: number,
    key: keyof ColumnType,
    val: string | number | boolean
  ) => {
    console.log(col, item);
    setColumnData((pre) => {
      let t = pre[index] && pre[index][key];
      t !== undefined && (t = val);
      return [...pre];
    });
  };

  const cols: ColumnProps<ColumnType>[] = [
    {
      title: '名',
      dataIndex: 'name',
      width: 200,
      render: (col: string, item, index) => {
        return (
          <Input
            value={item.name}
            onChange={(val) => {
              onChangeColumn(col, item, index, 'name', val);
            }}
          />
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'data_type',
      width: 160,
      render: (col, item, index) => {
        return (
          <Select
            defaultValue={item.data_type}
            value={item.data_type}
            onChange={(val) => {
              onChangeColumn(col, item, index, 'data_type', val);
            }}
          >
            {columnTypeOpts.map((opt) => (
              <Option key={opt} value={opt}>
                {opt}
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: '长度',
      dataIndex: 'max_length',
      render: (col, item, index) => (
        <InputNumber
          value={item.max_length}
          onChange={(val) => {
            onChangeColumn(col, item, index, 'max_length', val);
          }}
        />
      ),
      width: 120,
    },
    {
      title: '主键',
      dataIndex: 'is_primary_key',
      render: (col, item, index) => (
        <Checkbox
          checked={item.is_primary_key}
          onChange={(val) => {
            onChangeColumn(col, item, index, 'is_primary_key', val);
          }}
        />
      ),
      width: 80,
    },
    {
      title: '注释',
      dataIndex: 'comment',
      render: (col: string, item, index) => {
        return (
          <Input
            value={item.name}
            onChange={(val) => {
              onChangeColumn(col, item, index, 'comment', val);
            }}
          />
        );
      },
    },
  ];

  const handleSave = () => {
    console.log('handleSave');
  };
  const handleAdd = () => {
    const newItem: ColumnType = {
      table: '',
      name: '',
      data_type: 'int',
      max_length: 0,
      is_primary_key: false,
      comment: '',
      id: nanoid(),
    };
    setColumnData((pre) => [...pre, newItem]);
  };
  const handleCreateSQL = () => {
    console.log('handleCreateSQL');
  };

  const renderBtnGroup = () => {
    return (
      <Space>
        <Button icon={<IconPlus />} onClick={handleAdd}>
          新增字段
        </Button>
        <Button icon={<IconSync />} onClick={handleSave}>
          保存
        </Button>
        <Button icon={<IconSync />} onClick={handleCreateSQL}>
          查看 SQL
        </Button>
      </Space>
    );
  };
  return (
    <>
      <div style={{ marginBottom: 10, paddingLeft: 8 }}>{renderBtnGroup()}</div>
      <Table
        columns={cols}
        rowKey="id"
        data={transformColumnToData(columnData)}
        border={false}
        size="mini"
      />
    </>
  );
};

export default memo(DesignView);
