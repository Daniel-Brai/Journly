export interface Participants {
  [participant_id: string]: string;
}

export interface Poll {
  id: string;
  admin_id: string;
  poll_topic: string;
  votes_per_participant: number;
  participants: Participants,
}

export interface CreatePoll {
  readonly poll_topic: string;
  readonly votes_per_participant: number;
  readonly participant_name: string;
}

export interface JoinPoll {
  readonly poll_id: string;
  readonly participant_name: string;
}

export interface RejoinPoll {
  readonly poll_id: string;
  readonly participant_id: string;
  readonly participant_name: string;
}

