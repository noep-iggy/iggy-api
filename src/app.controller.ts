import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AdminService } from './modules/admin/admin.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly adminService: AdminService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/populate')
  populateDatabase() {
    this.appService.populateDatabase();
  }

  @Get('/create-default-admin')
  loadAdmin() {
    return this.adminService.loadAdmin();
  }
}
