export type UserData = {
  email: string;
  meets: string[];
};

export type MeetData = {
  code: string;
  adminCode: string;
  name: string;
  roster: Athlete[];
  races: string[];
};

export type Athlete = {
  bib: number;
  name: string;
  age: number;
  gender: string;
  team: string;
};

export type Race = {
  meet: string;
  code: string;
  name: string;
  bibs: number[];
  times: number[];
};

export type BackupRace = {
  code: string;
  bibs: number[];
  times: number[];
};
