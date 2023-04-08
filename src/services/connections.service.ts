import { redisConnection } from "../redisConnection";
import { UserStatusService } from "./userStatus.service";

export class ConnectionsService {
  private readonly redisConnection;
  private readonly userStatusService: UserStatusService;

  private readonly connections: Record<number, number> = {};

  constructor(userStatusService: UserStatusService) {
    this.redisConnection = redisConnection;
    this.userStatusService = userStatusService;
  }

  getConnectionByUser(userId: number) {
    return this.connections[userId];
  }

  async setConnection(userId1: number, userId2: number) {
    await this.userStatusService.setUserStatus(userId1, "connected");
    await this.userStatusService.setUserStatus(userId2, "connected");

    this.connections[userId1] = userId2;
    this.connections[userId2] = userId1;
  }

  async stopConnection(userId: number) {
    const userId2 = this.connections[userId];

    await this.userStatusService.deleteUserStatus(userId);
    await this.userStatusService.deleteUserStatus(userId2);

    delete this.connections[userId2];
    delete this.connections[userId];
  }
}
