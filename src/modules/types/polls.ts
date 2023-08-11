export type Participants = {
  [participant_id: string]: string;
};

export type Nomination = {
  participant_id: string;
  description: string;
};

export type NominationId = string;

export type Nominations = {
  [nomination_id: NominationId]: Nomination;
};

export type Rankings = {
  [participant_id: string]: NominationId[];
};

export type RankingScore = {
  [nomination_id: string]: number;
};

export type ResultsData = {
  nomination_id: NominationId;
  nomination_description: string;
  score: number;
};

export type Results = Array<ResultsData>;

export type Poll = {
  id: string;
  created_by: string;
  topic: string;
  topic_image_url: string;
  votes_per_participant: number;
  participants: Participants;
  nominations: Nominations;
  results: Results;
  rankings: Rankings;
  signature: string;
};
