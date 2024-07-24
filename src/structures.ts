export type UserData = {
  email: string;
  meets: string[];
};

export type MeetData = {
  code: string;
  adminCode: string;
  name: string;
  roster: Athlete[];
};

export type Athlete = {
  bib: number;
  name: string;
  age: number;
};
