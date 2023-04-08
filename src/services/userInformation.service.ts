import { UserInfoModel } from "../models";
import { redisConnection } from "../redisConnection";
import { UserStatusService } from "./userStatus.service";

export class UserInfoService {
  private readonly redisConnection;
  private readonly userStatusService: UserStatusService;
  private readonly userInfoModel;

  constructor(userStatusService: UserStatusService) {
    this.redisConnection = redisConnection;
    this.userStatusService = userStatusService;
    this.userInfoModel = UserInfoModel;
  }

  async saveInfo(userId: number, text: string) {
    const oldInfo = await this.userInfoModel.findById(userId);

    if (oldInfo) {
      await this.userInfoModel.deleteOne({
        _id: userId,
      });
    }

    const newInfo = new this.userInfoModel({
      _id: userId,
      bio: text,
    });

    const result = await newInfo.save();

    console.log(result);

    this.userStatusService.deleteUserStatus(userId);
  }

  async getInfoById(userId: number) {
    return await this.userInfoModel.findById(userId);
  }
}
