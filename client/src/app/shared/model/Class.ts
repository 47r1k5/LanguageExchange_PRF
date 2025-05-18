export interface Class {
  _id: string;
  name: string;
  description: string;
  learn_language: string;
  speak_language: string;
  level: string;
  free_space: number;
  startDate: string;
  endDate: string;
  loc: string;
  teacherId: { _id: string; first_name: string; last_name: string; };
  studentsIds: string[];
  createdAt: string;
}
