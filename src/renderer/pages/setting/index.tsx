import { Form, Select, Typography } from '@arco-design/web-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const FormItem = Form.Item;

const langOptions = ['en', 'zh'];

const Setting: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <Typography.Title>{t('setting.title')}</Typography.Title>
      <Form style={{ width: 600 }} autoComplete="off" labelAlign="left">
        <FormItem
          label={t('setting.language')}
          labelCol={{
            span: 4,
          }}
          wrapperCol={{ span: 10 }}
        >
          <Select options={langOptions} onChange={changeLanguage} />
        </FormItem>
      </Form>
    </div>
  );
};

export default Setting;
