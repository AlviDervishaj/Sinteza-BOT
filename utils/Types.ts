export type Response = {
  time: string,
  date: string,
  type: string,
  username: string,
  processId: string,
}

export type BotFormData = {
  username: string;
  device: string;
  password: string;
  "speed-multiplier": number;
  "truncate-sources": string,
  "blogger-followers"?: string[],
  "hashtag-likers-top"?: string[],
  "unfollow-non-followers"?: string,
  "unfollow-skip-limit"?: string,
  "working-hours"?: string[],
};