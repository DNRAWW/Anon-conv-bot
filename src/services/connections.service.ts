import { ConnectionModel } from "../models";
import { redisConnection } from "../redisConnection";
import { UserStatusService } from "./userStatus.service";

export class ConnectionsService {
  private readonly redisConnection;
  private readonly userStatusService: UserStatusService;

  private readonly connectionModel;

  constructor(userStatusService: UserStatusService) {
    this.redisConnection = redisConnection;
    this.userStatusService = userStatusService;
    this.connectionModel = ConnectionModel;
  }

  async getConnectionByUser(userId: number) {
    const connection = await this.connectionModel.findOne({
      $or: [{ userId1: userId }, { userId2: userId }],
    });

    return connection;
  }

  async setConnection(userId1: number, userId2: number) {
    await this.userStatusService.setUserStatus(userId1, "connected");
    await this.userStatusService.setUserStatus(userId2, "connected");

    const newConnection = new this.connectionModel({
      userId1: userId1,
      userId2: userId2,
    });

    await newConnection.save();
  }

  async stopConnection(userId: number) {
    const connection = await this.getConnectionByUser(userId);

    if (!connection) {
      return;
    }

    await this.userStatusService.deleteUserStatus(userId);
    await this.userStatusService.deleteUserStatus(connection.userId2);

    await this.connectionModel.deleteOne({
      userId1: userId,
      userId2: connection.userId2,
    });
  }
}
