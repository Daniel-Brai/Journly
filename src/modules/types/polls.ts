export interface ICreatePoll {
  readonly poll_topic: string;
  readonly votes_per_voter: number;
  readonly voter_name: string;
}

export interface IJoinPoll {
  readonly poll_id: string;
  readonly voter_name: string;
}

export interface IRejoinPoll {
  readonly poll_id: string;
  readonly voter_id: string;
  readonly voter_name: string;
}
