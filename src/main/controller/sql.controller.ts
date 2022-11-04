import { ClientFactory, Controller, Get } from '@/core';

@Controller('execSql')
class SqlController {
  @Get()
  async raw(data: { sqlString: string; connectionId: string; db: string }) {
    const { sqlString, connectionId, db } = data;
    const client = await ClientFactory.getInstant().getClient(connectionId, db);
    return client?.exec(sqlString);
  }

  @Get('/showDatabases')
  async getDatabases(id: string) {
    const client = await ClientFactory.getInstant().getClient(id);
    return client?.showDatabases();
  }

  @Get('/schema')
  async getSchema({ connectionId, db }: { connectionId: string; db: string }) {
    console.log(connectionId, db);

    const client = await ClientFactory.getInstant().getClient(connectionId, db);
    return client?.getSchema();
  }
}

export default SqlController;
