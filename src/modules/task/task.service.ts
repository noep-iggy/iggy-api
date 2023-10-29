import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import {
  AnimalStatusEnum,
  CreateTaskApi,
  TaskDto,
  TaskStatusEnum,
  UpdateTaskApi,
} from '@/types';
import { decryptObject, encryptObject } from '@/utils';
import { AnimalService } from '../animal/animal.service';
import { errorMessage } from '@/errors';
import { UserService } from '../user/user.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MediaService } from '../media/media.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    private readonly animalService: AnimalService,
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
  ) {}

  formatTask(taskCrypted: Task): TaskDto {
    if (!taskCrypted) return;
    const task = decryptObject(taskCrypted);
    return {
      ...task,
      users: task.users.map((user) => user.id),
      animals: task.animals.map((animal) => animal.id),
      picture: this.mediaService.formatMedia(task.picture),
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
      const taskUpdated = await this.taskRepository.save({
        ...encryptTask,
        recurrence,
        date: new Date(date),
        users,
        animals,
        status: TaskStatusEnum.TODO,
      });
      return taskUpdated;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_CREATED);
    }
  }

  async findTasks(): Promise<Task[]> {
    try {
      const tasks = await this.taskRepository.find();
      return tasks;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    }
  }

  async getTaskById(id: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id },
        relations: ['users', 'animals'],
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
        relations: ['users', 'animals'],
      });
      return tasks;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    }
  }

  async findTasksByAnimalId(animalId: string): Promise<Task[]> {
    try {
      const tasks = await this.taskRepository.find({
        where: { animals: { id: animalId } },
        relations: ['users', 'animals'],
      });
      return tasks;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('task').NOT_FOUND);
    }
  }

  async updateTask(body: UpdateTaskApi, id: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id },
        relations: ['users', 'animals'],
      });
      const {
        recurrence,
        date,
        userIds,
        animalIds,
        pictureId,
        status,
        ...taskToCrypt
      } = body;
      let animals = [];
      if (animalIds)
        animals = await Promise.all(
          animalIds
            ? animalIds?.map((animalId) =>
                this.animalService.findOneById(animalId),
              )
            : undefined,
        );
      let users = [];
      if (userIds)
        users = await Promise.all(
          userIds && userIds?.map((userId) => this.userService.getUser(userId)),
        );
      let findPicture = null;
      if (pictureId)
        findPicture = await this.mediaService.getMediaById(pictureId);
      findPicture = await this.mediaService.getMediaById(pictureId);
      const encryptTask = encryptObject(taskToCrypt);
      const taskUpdated = await this.taskRepository.save({
        ...task,
        title: taskToCrypt.title ? encryptTask.title : task.title,
        description: taskToCrypt.description
          ? encryptTask.description
          : task.description,
        recurrence: recurrence ? recurrence : task.recurrence,
        date: date ? new Date(date) : task.date,
        users: userIds ? users : task.users,
        animals: animalIds ? animals : task.animals,
        status: status ? status : task.status,
        message: taskToCrypt.message ? encryptTask.message : task.message,
        picture: pictureId ? findPicture : task.picture,
        updatedAt: new Date(),
      });
      return taskUpdated;
    } catch (error) {
      console.log(error);
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

  async deleteTask(task: Task): Promise<void> {
    try {
      await this.taskRepository.delete({ id: task.id });
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
      await this.animalService.updateAnimalsStatus(
        AnimalStatusEnum.HAPPY,
        task.animals,
      );
      await this.mediaService.deleteMedia(task.picture.id);
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
            await this.deleteTask(task);
            await this.animalService.updateAnimalsStatus(
              AnimalStatusEnum.SAD,
              task.animals,
            );
          }
          if (task.status === TaskStatusEnum.DONE) {
            await this.deleteTask(task);
          }
        }
      }),
    );
  }
}
