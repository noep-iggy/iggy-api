import { errorMessage } from '@/errors';
import {
  CreateTaskApi,
  TaskDto,
  TaskSearchParams,
  TaskStatusEnum,
  UpdateTaskApi,
} from '@/types';
import { decryptObject, encryptObject } from '@/utils';
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { AnimalService } from '../animal/animal.service';
import { MediaService } from '../media/media.service';
import { RecurrenceService } from '../recurrence/recurrence.service';
import { UserService } from '../user/user.service';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getDateConditions } from '@/utils/date';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    @Inject(forwardRef(() => AnimalService))
    private readonly animalService: AnimalService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
    @Inject(forwardRef(() => RecurrenceService))
    private readonly recurrenceService: RecurrenceService,
  ) {}

  formatTask(taskCrypted: Task): TaskDto {
    if (!taskCrypted) return;
    const task = decryptObject(taskCrypted);
    return {
      ...task,
      users: task.users.map((user) => this.userService.formatUser(user)),
      animals: task.animals.map((animal) =>
        this.animalService.formatAnimal(animal),
      ),
      picture: this.mediaService.formatMedia(task.picture),
      recurrence: task.recurrence ? task.recurrence : undefined,
    };
  }

  searchConditions(
    searchParams?: TaskSearchParams,
    houseId?: string,
  ): FindManyOptions<Task> {
    if (!searchParams) return { relations: ['users', 'animals', 'recurrence'] };

    const order = {
      [searchParams.orderBy ?? 'createdAt']: searchParams.orderType ?? 'DESC',
    };

    searchParams.status = searchParams.status ?? TaskStatusEnum.TODO;

    const where: any = {
      title: Raw(
        (alias) =>
          `LOWER(${alias}) Like '%${searchParams.search?.toLowerCase()}%'`,
      ),
      status: Raw(
        (alias) =>
          `LOWER(${alias}) Like '%${searchParams.status?.toLocaleLowerCase()}%'`,
      ),

      ...getDateConditions(searchParams),
      isArchived: searchParams.isArchived,
    };

    if (searchParams.animalId) {
      where.animals = {
        id: searchParams.animalId,
      };
    }

    if (houseId) {
      where.users = {
        house: {
          id: houseId,
        },
      };
    }

    return {
      where,
      relations: ['users', 'animals', 'recurrence'],
      order: {
        ...order,
        users: {
          firstName: searchParams.orderType ?? 'DESC',
        },
        animals: {
          name: searchParams.orderType ?? 'DESC',
        },
        recurrence: {
          type: searchParams.orderType ?? 'DESC',
        },
      },
      skip: searchParams.page * searchParams.pageSize,
      take: searchParams.pageSize,
    };
  }

  async createTask(body: CreateTaskApi): Promise<Task> {
    try {
      const { recurrence, date, userIds, title, animalIds, ...task } = body;
      const encryptTask = encryptObject(task);
      const animals = await Promise.all(
        animalIds.map((animalId) => this.animalService.findOneById(animalId)),
      );
      const users = await Promise.all(
        userIds.map((userId) => this.userService.getUser(userId)),
      );
      const taskCreated = await this.taskRepository.save({
        ...encryptTask,
        recurrence: null,
        date: new Date(date),
        users,
        animals,
        title,
        status: TaskStatusEnum.TODO,
      });
      if (recurrence) {
        await this.recurrenceService.createRecurrence(
          { date: taskCreated.date, type: recurrence },
          taskCreated,
        );
      }
      return taskCreated;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_CREATED);
    }
  }

  async getTasks(searchParams: TaskSearchParams): Promise<Task[]> {
    try {
      return await this.taskRepository.find(
        this.searchConditions(searchParams),
      );
    } catch (error) {
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    }
  }

  async getTaskById(id: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id },
        relations: ['users', 'animals', 'recurrence'],
      });
      return task;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    }
  }

  async findTaskByUserId(
    userId: string,
    searchParams?: TaskSearchParams,
  ): Promise<Task[]> {
    try {
      const conditions = this.searchConditions(searchParams);
      const tasks = await this.taskRepository.find({
        ...conditions,
        where: { users: { id: userId } },
      });
      return tasks;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    }
  }

  async findTaskByHouseId(
    houseId: string,
    searchParams?: TaskSearchParams,
  ): Promise<Task[]> {
    try {
      const tasks = await this.taskRepository.find({
        ...this.searchConditions(searchParams, houseId),
      });
      return tasks;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    }
  }

  async findTasksByAnimalId(
    animalId: string,
    searchParams?: TaskSearchParams,
  ): Promise<Task[]> {
    try {
      const tasks = await this.taskRepository.find({
        ...this.searchConditions(searchParams),
        where: { animals: { id: animalId }, isArchived: false },
      });
      return tasks;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    }
  }

  async findTaskByStatus(
    houseId: string,
    status: TaskStatusEnum,
    searchParams?: TaskSearchParams,
  ): Promise<Task[]> {
    try {
      const tasks = await this.findTaskByHouseId(houseId, searchParams);
      return tasks.filter((task) => task.status === status);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    }
  }

  async findArchiveTaskByHouseId(
    houseId: string,
    searchParams?: TaskSearchParams,
  ): Promise<Task[]> {
    try {
      const tasks = await this.taskRepository.find({
        ...this.searchConditions(searchParams),
        where: { users: { house: { id: houseId } }, isArchived: true },
      });
      return tasks;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    }
  }

  async removeRecurrence(taskId: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id: taskId },
        relations: ['recurrence'],
      });
      await this.recurrenceService.deleteRecurrence(task.recurrence.id);
      return await this.getTaskById(taskId);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_UPDATED);
    }
  }

  async updateTask(body: UpdateTaskApi, id: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id },
        relations: ['users', 'animals', 'recurrence'],
      });

      const {
        date,
        userIds,
        animalIds,
        title,
        pictureId,
        status,
        ...taskToCrypt
      } = body;

      let recurrenceToUpdate = null;
      if (body.recurrence.type) {
        if (task.recurrence) {
          recurrenceToUpdate = await this.recurrenceService.updateRecurrence(
            body.recurrence,
            task.recurrence.id,
          );
        } else {
          recurrenceToUpdate = await this.recurrenceService.createRecurrence(
            { type: body.recurrence.type, date: new Date(task.date) },
            task,
          );
        }
      } else if (task.recurrence) {
        await this.recurrenceService.deleteRecurrence(task.recurrence.id);
      }

      const [animals, users, findPicture] = await Promise.all([
        animalIds
          ? Promise.all(
              animalIds.map((animalId) =>
                this.animalService.findOneById(animalId),
              ),
            )
          : undefined,
        userIds
          ? Promise.all(
              userIds.map((userId) => this.userService.getUser(userId)),
            )
          : undefined,
        pictureId ? this.mediaService.getMediaById(pictureId) : null,
      ]);

      const taskCrypted = encryptObject(taskToCrypt);
      const updatedTaskData = {
        recurrence: recurrenceToUpdate,
        date: date ? new Date(date) : task.date,
        title: title ?? task.title,
        users: userIds ? users : task.users,
        animals: animalIds ? animals : task.animals,
        status: date ? TaskStatusEnum.TODO : status ?? task.status,
        message: taskToCrypt.message
          ? encryptObject(taskToCrypt.message)
          : task.message,
        picture: pictureId ? findPicture : task.picture,
        updatedAt: new Date(),
      };

      const taskUpdated = await this.taskRepository.save({
        ...task,
        ...taskCrypted,
        ...updatedTaskData,
      });

      return taskUpdated;
    } catch (error) {
      console.log('TASK ERROR', error);
      throw new BadRequestException(errorMessage.api('task').NOT_UPDATED);
    }
  }

  async removeRecurrenceTask(taskId: string): Promise<void> {
    await this.taskRepository.update({ id: taskId }, { recurrence: null });
  }

  async checkTask(id: string, pictureId: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id },
        relations: ['users', 'animals'],
      });
      const findPicture = await this.mediaService.getMediaById(pictureId);
      const taskUpdated = await this.taskRepository.save({
        ...task,
        status: TaskStatusEnum.TO_VALIDATE,
        message: undefined,
        picture: findPicture,
        updatedAt: new Date(),
      });
      return taskUpdated;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_UPDATED);
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await this.taskRepository.delete({ id });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_DELETED);
    }
  }

  async validateTask(id: string): Promise<Task> {
    try {
      const task = await this.getTaskById(id);
      const taskUpdated = await this.taskRepository.save({
        ...task,
        status: TaskStatusEnum.DONE,
        updatedAt: new Date(),
      });
      await this.animalService.updateAnimalsStatus('upgrade', task.animals);
      return taskUpdated;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_UPDATED);
    }
  }

  async refuseTask(id: string, message: string): Promise<Task> {
    try {
      const task = await this.getTaskById(id);
      const cryotMessage = encryptObject({ message });
      await this.taskRepository.update(
        { id },
        {
          status: TaskStatusEnum.TODO,
          message: cryotMessage.message,
          picture: null,
          updatedAt: new Date(),
        },
      );
      task.picture && (await this.mediaService.deleteMedia(task.picture.id));
      return await this.getTaskById(id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_UPDATED);
    }
  }

  //CRON TASK

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkIsCronExpired(): Promise<void> {
    const tasks = await this.taskRepository.find({
      relations: ['animals'],
    });
    await Promise.all(
      tasks.map(async (task) => {
        if (new Date(task.date) < new Date(Date.now())) {
          if (
            task.status === TaskStatusEnum.TODO ||
            task.status === TaskStatusEnum.TO_VALIDATE
          ) {
            await this.animalService.updateAnimalsStatus(
              'downgrade',
              task.animals,
            );
          }
          await this.taskRepository.update(
            { id: task.id },
            {
              isArchived: true,
              updatedAt: new Date(),
            },
          );
        }
      }),
    );
  }
}
