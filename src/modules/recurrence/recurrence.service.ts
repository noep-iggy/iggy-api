import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Recurrence } from './recurrence.entity';
import {
  CreateRecurrenceApi,
  RecurrenceDto,
  TaskRecurrenceEnum,
  UpdateRecurrenceApi,
} from '@/types';
import { Task } from '../task/task.entity';
import { errorMessage } from '@/errors';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskService } from '../task/task.service';
import { decryptObject } from '@/utils';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RecurrenceService {
  constructor(
    @InjectRepository(Recurrence)
    private reccurenceRepository: Repository<Recurrence>,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
  ) {}

  formatRecurrence(recurrence: Recurrence): RecurrenceDto {
    if (!recurrence) return;
    return {
      type: recurrence.type,
      date: recurrence.date,
      id: recurrence.id,
      updatedAt: recurrence.updatedAt,
      createdAt: recurrence.createdAt,
    };
  }

  async createRecurrence(
    recurrence: CreateRecurrenceApi,
    task: Task,
  ): Promise<Recurrence> {
    try {
      const recurrenceCreated = await this.reccurenceRepository.save({
        ...recurrence,
        task,
      });
      return recurrenceCreated;
    } catch (error) {
      throw new Error(errorMessage.api('recurrence').NOT_CREATED);
    }
  }

  async updateRecurrence(
    body: UpdateRecurrenceApi,
    recurrenceId: string,
  ): Promise<Recurrence> {
    try {
      const recurrence = await this.reccurenceRepository.findOne({
        where: { id: recurrenceId },
      });
      const recurrenceUpdated = await this.reccurenceRepository.save({
        ...recurrence,
        ...body,
      });
      return recurrenceUpdated;
    } catch (error) {
      throw new Error(errorMessage.api('recurrence').NOT_UPDATED);
    }
  }

  async deleteRecurrence(recurrenceId: string): Promise<void> {
    try {
      await this.reccurenceRepository.delete(recurrenceId);
    } catch (error) {
      console.log(error);
      throw new Error(errorMessage.api('recurrence').NOT_DELETED);
    }
  }

  // CRON RECURRENCE

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkDailyRecurrence() {
    try {
      const recurrences = await this.reccurenceRepository.find({
        where: { type: TaskRecurrenceEnum.DAILY },
        relations: ['task', 'task.users', 'task.animals'],
      });
      await Promise.all(
        recurrences.map(async (recurrence) => {
          if (new Date(recurrence.task.date) > new Date()) return;
          const task = recurrence.task;
          await this.taskService.removeRecurrence(task.id);
          const decryptedTask = decryptObject({
            title: task.title,
            description: task.description,
          });
          await this.taskService.createTask({
            ...decryptedTask,
            date: new Date(
              new Date(Date.now()).setDate(task.date.getDate() + 1),
            ),
            userIds: task.users.map((user) => user.id),
            animalIds: task.animals.map((animal) => animal.id),
            recurrence: TaskRecurrenceEnum.DAILY,
          });
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async checkWeeklyRecurrence() {
    try {
      const recurrences = await this.reccurenceRepository.find({
        where: { type: TaskRecurrenceEnum.WEEKLY },
        relations: ['task', 'task.users', 'task.animals'],
      });
      await Promise.all(
        recurrences.map(async (recurrence) => {
          if (new Date(recurrence.task.date) > new Date()) return;
          const task = recurrence.task;
          await this.taskService.removeRecurrence(task.id);
          const decryptedTask = decryptObject({
            title: task.title,
            description: task.description,
          });
          await this.taskService.createTask({
            ...decryptedTask,
            date: new Date(
              new Date(Date.now()).setDate(new Date(Date.now()).getDate() + 7),
            ),
            userIds: task.users.map((user) => user.id),
            animalIds: task.animals.map((animal) => animal.id),
            recurrence: TaskRecurrenceEnum.WEEKLY,
          });
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async checkMonthlyRecurrence() {
    try {
      const recurrences = await this.reccurenceRepository.find({
        where: { type: TaskRecurrenceEnum.MONTHLY },
        relations: ['task', 'task.users', 'task.animals'],
      });
      await Promise.all(
        recurrences.map(async (recurrence) => {
          if (new Date(recurrence.task.date) > new Date()) return;
          const task = recurrence.task;
          await this.taskService.removeRecurrence(task.id);
          const decryptedTask = decryptObject({
            title: task.title,
            description: task.description,
          });
          await this.taskService.createTask({
            ...decryptedTask,
            date: new Date(
              new Date(Date.now()).setDate(new Date(Date.now()).getMonth() + 1),
            ),
            userIds: task.users.map((user) => user.id),
            animalIds: task.animals.map((animal) => animal.id),
            recurrence: TaskRecurrenceEnum.MONTHLY,
          });
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }
}
