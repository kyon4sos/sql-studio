import { DbConfig } from '@/common';
import { Controller, Get, Post } from '../core/decorator';
import Repository from '../repository';

@Controller('tab')
class TabController {
  private repo: Repository;

  constructor() {
    this.repo = Repository.getInstant();
  }

  @Get()
  list() {
    return this.repo.listConnection();
  }

  @Post()
  Create(data: DbConfig) {
    return this.repo.saveConnection(data);
  }
}

export default TabController;
