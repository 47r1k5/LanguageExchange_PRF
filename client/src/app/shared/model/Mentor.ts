export interface Mentor {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  languages_known: string[];
  bio:string;
  classes:[{
    _id: string;
    name: string;
    learn_language: string;
    level: string;
    free_space: number;
  }]
}