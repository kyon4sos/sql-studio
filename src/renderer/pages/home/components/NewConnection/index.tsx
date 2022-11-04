import {
  Modal,
  Form,
  Button,
  Checkbox,
  Input,
  Space,
  Grid,
  InputNumber,
  Message,
  Select,
} from '@arco-design/web-react';
import React, {
  ForwardedRef,
  useImperativeHandle,
  useRef,
  forwardRef,
} from 'react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useAppStore } from '@/store';
import type { DbConfig } from '@/common';
import { useConnectionReducer } from '@/reducer/connection';
import { useTranslation } from 'react-i18next';

const { Row } = Grid;
const { Col } = Grid;
const FormItem = Form.Item;
const { Option } = Select;

const wrapperCol = {
  offset: 5,
};

const fieldStyle = {
  width: 280,
};

const options = [
  { label: 'MySQL', value: 'mysql2' },
  { label: 'PostgreSQL', value: 'pg' },
  { label: 'SQLLite', value: 'SqlLite' },
];

type ConnectionPropType = {
  ref: ForwardedRef<ConnectionRef>;
};

const Connection: React.FC<ConnectionPropType> = ({ ref }) => {
  const { t } = useTranslation();
  const [state, dispatch] = useConnectionReducer();
  const [form] = Form.useForm<DbConfig>();
  const hadTest = useRef(false);
  const store = useAppStore();

  const { status, text, loading, title, visible, formValue } = state;

  useImperativeHandle(ref, () => {
    return {
      edit: (data) => {
        dispatch({ type: 'edit', payload: { ...data, savePassword: true } });
      },
    };
  });

  const fetch = async () => {
    const conns = (await window.electron.ipc.getConnections()) ?? [];
    const payload = conns.map((conn) => ({
      ...conn,
      key: conn.id,
      type: 'connection',
      connectionId: conn.id,
    }));

    store.dispatch({ type: 'SET_CONNECTIONS', payload });
  };

  const reset = () => {
    form.resetFields();
    dispatch({ type: 'reset' });
  };

  const handleNewConnection = () => {
    dispatch({ type: 'create' });
  };

  const onTest = async () => {
    hadTest.current = true;
    try {
      await form.validate();
    } catch (err) {
      return;
    }
    try {
      dispatch({ type: 'testing' });
      await window.electron.ipc.testConnect(form.getFieldsValue() as DbConfig);
      setTimeout(() => {
        dispatch({ type: 'success' });
      }, 1500);
    } catch (err) {
      Message.error((err as Error).message);
      dispatch({ type: 'error' });
    }
  };

  const onChangeForm = () => {
    hadTest.current && reset();
    hadTest.current = false;
  };

  const handleOk = async () => {
    await window.electron.ipc.createConnection(
      form.getFieldsValue() as DbConfig
    );
    dispatch({ type: 'initial' });
    fetch();
  };

  const handleCancel = () => {
    dispatch({ type: 'initial' });
  };

  const footer = (
    <>
      <Row justify="start">
        <Col span={4}>
          <Button
            type="secondary"
            loading={loading}
            onClick={onTest}
            status={status}
          >
            {text}
          </Button>
        </Col>
        <Col span={20}>
          <Space align="start">
            <Button htmlType="submit" onClick={handleCancel}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" onClick={handleOk}>
              确认
            </Button>
          </Space>
        </Col>
      </Row>
    </>
  );

  return (
    <>
      <Button type="primary" icon={<IconPlus />} onClick={handleNewConnection}>
        {t('connection.newConn')}
      </Button>
      <Modal
        title={title}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        autoFocus={false}
        focusLock
        footer={footer}
      >
        <Form
          style={{
            width: '100%',
          }}
          autoComplete="off"
          layout="horizontal"
          form={form}
          initialValues={formValue}
          onChange={onChangeForm}
        >
          <FormItem field="id" hidden>
            <Input />
          </FormItem>
          <FormItem label={t('connection.type')} field="client">
            <Select placeholder="Please select" style={{ width: 154 }}>
              {options.map((option, index) => (
                <Option
                  key={option.label}
                  disabled={index !== 0}
                  value={option.value}
                >
                  {option.label}
                </Option>
              ))}
            </Select>
          </FormItem>
          <FormItem label={t('connection.connectionName')} field="title">
            <Input style={fieldStyle} placeholder={t('connection.enterName')} />
          </FormItem>
          <FormItem
            label={t('connection.host')}
            field="host"
            rules={[{ required: true, message: t('connection.requiredHost') }]}
          >
            <Input style={fieldStyle} placeholder={t('connection.hostOrIP')} />
          </FormItem>
          <FormItem
            label={t('connection.user')}
            field="user"
            rules={[
              { required: true, message: t('connection.requiredUsername') },
            ]}
          >
            <Input
              style={fieldStyle}
              placeholder={t('connection.enterUserName')}
            />
          </FormItem>
          <FormItem
            label={t('connection.password')}
            field="password"
            required
            rules={[{ required: true, message: t('connection.requiredPas') }]}
          >
            <Input style={fieldStyle} placeholder={t('connection.enterPas')} />
          </FormItem>
          <FormItem
            label={t('connection.database')}
            field="database"
            rules={[{ required: true, message: t('connection.requiredDb') }]}
          >
            <Input style={fieldStyle} placeholder={t('connection.enterDb')} />
          </FormItem>
          <FormItem
            label={t('connection.port')}
            field="port"
            rules={[{ required: true, message: '端口是必填项' }]}
          >
            <InputNumber
              style={fieldStyle}
              placeholder={t('connection.enterPort')}
            />
          </FormItem>
          <FormItem wrapperCol={wrapperCol} field="savePassword">
            <Checkbox>{t('connection.savePas')}</Checkbox>
          </FormItem>
        </Form>
      </Modal>
    </>
  );
};

export type ConnectionRef = { edit: (data: DbConfig) => void };

export default forwardRef<ConnectionRef, ConnectionPropType>((props, ref) =>
  Connection({ ...props, ref })
);
