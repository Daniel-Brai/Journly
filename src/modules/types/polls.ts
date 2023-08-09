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

export type Poll = {
  id: string;
  created_by: string;
  topic: string;
  topic_image_url: string;
  votes_per_participant: number;
  participants: Participants;
  nominations: Nominations;
  rankings: Rankings;
  signature: string;
};
