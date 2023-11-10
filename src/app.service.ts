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
      populate.user.parent,
    );
    console.log(
      `LOGIN PARENT :\n email : ${user.email} : password : ${populate.user.parent.password} \n token : ${access_token.access_token}`,
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

    const { user: child, access_token: child_access_token } =
      await this.authService.joinChild(
        populate.user.child,
        joinCodeChild.house,
      );

    console.log(
      `LOGIN CHILD :\n firstName : ${child.firstName} : password : ${populate.user.child.password} \n token : ${child_access_token}`,
    );

    const tasksCreated = await Promise.all(
      populate
        .tasks([user, child], animalsCreated)
        .map((task) => this.taskService.createTask(task)),
    );

    const mediaCreated = await this.mediaService.populateMedias();

    await this.taskService.checkTask(tasksCreated[0].id, mediaCreated.id);

    await this.taskService.validateTask(tasksCreated[1].id);

    return 'Database populated';
  }
}
