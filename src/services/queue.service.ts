import { redisConnection } from "../redisConnection";
import { UserStatusService } from "./userStatus.service";

export class QueueService {
  private readonly redisConnection;
  private readonly userStatusService: UserStatusService;

  constructor(userStatusService: UserStatusService) {
    this.redisConnection = redisConnection;
    this.userStatusService = userStatusService;
  }

  async search(seekerId: number) {
    const user = await this.redisConnection.lPop("conv_queue");

    if (!user) {
      await this.addUserToQueue(seekerId);
    }

    return user;
  }

  async deleteUserFromQueue(userId: number) {
    await this.redisConnection.lRem("conv_queue", 1, String(userId));

    await this.userStatusService.deleteUserStatus(userId);
  }

  private async addUserToQueue(id: number) {
    const userStatus = await this.redisConnection.hGet(
      "users_status",
      String(id)
    );

    if (!userStatus) {
      await this.userStatusService.setUserStatus(id, "searching");
      await this.redisConnection.lPush("conv_queue", String(id));
    }
  }
}
