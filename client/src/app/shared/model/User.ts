export interface User {
    _id: string;
    email: string;
    first_name: string;
    last_name: string;
    languages_known: string[];
    languages_learning: string[];
    password: string;
}