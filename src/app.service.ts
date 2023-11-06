import { JoinCodeTypeEnum } from '@/types';
import { AnimalService } from './modules/animal/animal.service';
import { AuthService } from './modules/auth/auth.service';
import { Injectable } from '@nestjs/common';
import { HouseService } from './modules/house/house.service';
import { UserService } from './modules/user/user.service';
import { BillingPlanService } from './modules/billing-plan/billing-plan.service';
import { AffiliateService } from './modules/affiliate/affiliate.service';
import { JoinCodeService } from './modules/join-code/join-code.service';
import { TaskService } from './modules/task/task.service';
import { populate } from './populate';
import { MediaService } from './modules/media/media.service';

@Injectable()
export class AppService {
  constructor(
    private houseService: HouseService,
    private userService: UserService,
    private authService: AuthService,
    private billingPlanService: BillingPlanService,
    private affiliateService: AffiliateService,
    private animalService: AnimalService,
    private joinCodeService: JoinCodeService,
    private taskService: TaskService,
    private mediaService: MediaService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async populateDatabase(): Promise<string> {
    const { user, access_token } = await this.authService.register(
      populate.user.register,
    );
    console.log(
      `LOGIN PARENT :\n userName : ${user.userName} : password : ${populate.user.register.password} \n token : ${access_token.access_token}`,
    );

    await Promise.all(
      populate.billingPlans.map((billingPlan) =>
        this.billingPlanService.createBillingPlan(billingPlan),
      ),
    );

    await Promise.all(
      populate.affiliates.map((affiliate) =>
        this.affiliateService.createAffiliate(affiliate),
      ),
    );

    const house = await this.houseService.createHouse(populate.house, user);

    const animalsCreated = await Promise.all(
      populate.animals.map(
        async (animal) =>
          await this.animalService.createAnimal(animal, { ...user, house }),
      ),
    );

    const joinCodeChild = await this.joinCodeService.createJoincode(
      house,
      JoinCodeTypeEnum.CHILD,
    );

    const userCreated = await Promise.all(
      populate.user.standard.map(async (userData) => {
        const { user } = await this.authService.join(
          userData,
          joinCodeChild.code,
        );
        console.log(
          `LOGIN ENFANT :\n userName : ${user.userName} : password : ${userData.password} \n token : ${access_token.access_token}`,
        );

        return user;
      }),
    );

    const tasksCreated = await Promise.all(
      populate
        .tasks([user, ...userCreated], animalsCreated)
        .map((task) => this.taskService.createTask(task)),
    );

    const mediaCreated = await this.mediaService.populateMedias();

    await this.taskService.checkTask(tasksCreated[0].id, mediaCreated.id);

    await this.taskService.validateTask(tasksCreated[1].id);

    return 'Database populated';
  }
}
