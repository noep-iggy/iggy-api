import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RecurrenceService } from './recurrence.service';

@Controller('recurrences')
export class RecurrenceController {
  constructor(private readonly service: RecurrenceService) {}

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async deleteRecurrence(@Param('id') id: string) {
    return await this.service.deleteRecurrence(id);
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getRecurrence(@Param('id') id: string) {
    return await this.service.getRecurrence(id);
  }
}
