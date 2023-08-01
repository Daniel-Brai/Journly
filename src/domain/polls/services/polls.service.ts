import { Injectable } from '@nestjs/common';
import { ICreatePoll, IJoinPoll, IRejoinPoll } from '@modules/types';

@Injectable()
export class PollsService {
  async create(poll: ICreatePoll) {}
  async join(poll: IJoinPoll) {}
  async rejoin(poll: IRejoinPoll) {}
}
