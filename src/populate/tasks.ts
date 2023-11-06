import { CreateTaskApi } from './../types/api/Task';
import { Animal } from '@/modules/animal/animal.entity';
import { User } from '@/modules/user/user.entity';
import { TaskRecurrenceEnum } from '@/types';

export function tasks(users: User[], animals: Animal[]): CreateTaskApi[] {
  return [
    {
      title: 'Donner à manger au chat',
      description: 'Donner à manger au chat',
      date: new Date(new Date(Date.now()).setHours(21)),
      userIds: [users[0].id],
      animalIds: [animals[0].id],
    },
    {
      title: 'Donner à manger au chien',
      description: 'Donner à manger au chien',
      date: new Date(new Date(Date.now()).setHours(21)),
      recurrence: TaskRecurrenceEnum.DAILY,
      userIds: [users[1].id],
      animalIds: [animals[1].id],
    },
    {
      title: 'Sortir le chien',
      description: 'Sortir le chien',
      date: new Date(new Date(Date.now()).setHours(21)),
      userIds: [users[0].id, users[1].id],
      animalIds: [animals[1].id, animals[0].id],
    },
    {
      title: 'Faire un câlin aux animaux',
      description: 'Faire un câlin au chat',
      date: new Date(new Date(Date.now()).setHours(3)),
      userIds: [users[2].id],
      animalIds: [animals[0].id, animals[1].id],
    },
  ];
}
