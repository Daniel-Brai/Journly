export interface ParticipantData {
  [participant_id: string]: string;
}

export interface Participants {
  data: ParticipantData[];
}

export interface Poll {
  id: string;
  created_by: string;
  topic: string;
  topic_image_url: string;
  votes_per_participant: number;
  participants: Participants;
}
