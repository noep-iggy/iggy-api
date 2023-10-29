import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskApi, TaskDto, TaskStatusEnum } from '@/types';
import { decryptObject, encryptObject } from '@/utils';
import { AnimalService } from '../animal/animal.service';
import { errorMessage } from '@/errors';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    private readonly animalService: AnimalService,
    private readonly userService: UserService,
  ) {}

  formatTask(taskCrypted: Task): TaskDto {
    if (!taskCrypted) return;
    const task = decryptObject(taskCrypted);
    return {
      ...task,
      users: task.users.map((user) => user.id),
      animals: task.animals.map((animal) => animal.id),
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
}
