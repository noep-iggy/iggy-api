import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskApi, TaskDto, TaskStatusEnum, UpdateTaskApi } from '@/types';
import { decryptObject, encryptObject } from '@/utils';
import { AnimalService } from '../animal/animal.service';
import { errorMessage } from '@/errors';
import { UserService } from '../user/user.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MediaService } from '../media/media.service';
import { RecurrenceService } from '../recurrence/recurrence.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    private readonly animalService: AnimalService,
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
    private readonly recurrenceService: RecurrenceService,
  ) {}

  formatTask(taskCrypted: Task): TaskDto {
    if (!taskCrypted) return;
    const task = decryptObject(taskCrypted);
    return {
      ...task,
      users: task.users.map((user) => user.id),
      animals: task.animals.map((animal) => animal.id),
      picture: this.mediaService.formatMedia(task.picture),
      recurrence: task.recurrence ? task.recurrence : undefined,
    };
  }

  async createTask(body: CreateTaskApi): Promise<Task> {
    try {
      const { recurrence, date, userIds, animalIds, ...task } = body;
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

  async findTaskByUserId(userId: string): Promise<Task[]> {
    try {
      const tasks = await this.taskRepository.find({
        where: { users: { id: userId } },
        relations: ['users', 'animals', 'recurrence'],
      });
      return tasks;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    }
  }

  async findTaskByHouseId(houseId: string): Promise<Task[]> {
    try {
      const users = await this.userService.findUsersByHouseId(houseId);
      const tasks = await Promise.all(
        users.map((user) => this.findTaskByUserId(user.id)),
      );

      return tasks.flat().filter((task, index, self) => {
        return index === self.findIndex((t) => t.id === task.id);
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    }
  }

  async findTaskByStatus(
    houseId: string,
    status: TaskStatusEnum,
  ): Promise<Task[]> {
    try {
      const users = await this.userService.findUsersByHouseId(houseId);
      const tasks = await Promise.all(
        users.map((user) =>
          this.taskRepository.find({
            where: { users: { id: user.id }, status },
            relations: ['users', 'animals', 'recurrence'],
          }),
        ),
      );
      return tasks.flat().filter((task, index, self) => {
        return index === self.findIndex((t) => t.id === task.id);
      });
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
      const taskUpdated = await this.taskRepository.save({
        ...task,
        recurrence: null,
        updatedAt: new Date(),
      });
      await this.recurrenceService.deleteRecurrence(task.recurrence.id);
      return taskUpdated;
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

      const { date, userIds, animalIds, pictureId, status, ...taskToCrypt } =
        body;

      let recurrenceToUpdate = null;
      if (body.recurrence) {
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

      const updatedTaskData = {
        title: taskToCrypt.title
          ? encryptObject(taskToCrypt.title)
          : task.title,
        description: taskToCrypt.description
          ? encryptObject(taskToCrypt.description)
          : task.description,
        recurrence: recurrenceToUpdate ?? task.recurrence,
        date: date ? new Date(date) : task.date,
        users: userIds ? users : task.users,
        animals: animalIds ? animals : task.animals,
        status: status ?? task.status,
        message: taskToCrypt.message
          ? encryptObject(taskToCrypt.message)
          : task.message,
        picture: pictureId ? findPicture : task.picture,
        updatedAt: new Date(),
      };

      const taskUpdated = await this.taskRepository.save({
        ...task,
        ...updatedTaskData,
      });

      return taskUpdated;
    } catch (error) {
      console.log('TASK ERROR', error);
      throw new BadRequestException(errorMessage.api('task').NOT_UPDATED);
    }
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
      const task = await this.taskRepository.findOne({
        where: { id },
        relations: ['users', 'animals'],
      });
      const taskUpdated = await this.taskRepository.save({
        ...task,
        status: TaskStatusEnum.DONE,
        updatedAt: new Date(),
        picture: undefined,
      });
      await this.animalService.updateAnimalsStatus('upgrade', task.animals);
      if (task.picture) await this.mediaService.deleteMedia(task.picture.id);
      return taskUpdated;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_UPDATED);
    }
  }

  async refuseTask(id: string, message: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id },
        relations: ['users', 'animals'],
      });
      const cryotMessage = encryptObject({ message });
      const taskUpdated = await this.taskRepository.save({
        ...task,
        status: TaskStatusEnum.TODO,
        message: cryotMessage.message,
        updatedAt: new Date(),
        picture: undefined,
      });
      await this.mediaService.deleteMedia(task.picture.id);
      return taskUpdated;
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
          await this.updateTask(
            {
              status: TaskStatusEnum.ARCHIVED,
            },
            task.id,
          );
        }
      }),
    );
  }
}
