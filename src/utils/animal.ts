import { AnimalStatusEnum } from '@/types';

export function resolverAnimalStatus(
  sens: 'upgrade' | 'downgrade',
  status: AnimalStatusEnum,
): AnimalStatusEnum {
  if (sens === 'upgrade') {
    switch (status) {
      case AnimalStatusEnum.HAPPY:
        return AnimalStatusEnum.HAPPY;
      case AnimalStatusEnum.NORMAL:
        return AnimalStatusEnum.HAPPY;
      case AnimalStatusEnum.SAD:
        return AnimalStatusEnum.NORMAL;
      default:
        return AnimalStatusEnum.NORMAL;
    }
  } else {
    switch (status) {
      case AnimalStatusEnum.HAPPY:
        return AnimalStatusEnum.NORMAL;
      case AnimalStatusEnum.NORMAL:
        return AnimalStatusEnum.SAD;
      case AnimalStatusEnum.SAD:
        return AnimalStatusEnum.SAD;
      default:
        return AnimalStatusEnum.NORMAL;
    }
  }
}
