export interface Participants {
  [participant_id: string]: string;
}

export interface Nomination {
  participant_id: string;
  description: string;
}

export interface Nominations {
  [nomination_id: string]: Nomination;
}

export interface Poll {
  id: string;
  created_by: string;
  topic: string;
  topic_image_url: string;
  votes_per_participant: number;
  participants: Participants;
  signature: string;
}
