import { redisConnection } from "../redisConnection";

export class UserStatusService {
  private readonly redisConnection;

  constructor() {
    this.redisConnection = redisConnection;
  }

  async getUserStatus(id: number) {
    return await this.redisConnection.hGet("users_status", String(id));
  }

  async setUserStatus(
    id: number,
    status: "searching" | "connected" | "writing_bio"
  ) {
    await this.redisConnection.hSet("users_status", String(id), status);
  }

  async deleteUserStatus(id: number) {
    await this.redisConnection.hDel("users_status", String(id));
  }
}
