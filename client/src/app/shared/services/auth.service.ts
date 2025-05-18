import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../model/User';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { Class } from '../model/Class';
import { Mentor } from '../model/Mentor';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    this.http
      .get<User>('http://localhost:5000/profile', { withCredentials: true })
      .pipe(
        tap((user) => this.currentUserSubject.next(user)),
        catchError((_) => {
          this.currentUserSubject.next(null);
          return of(null);
        })
      )
      .subscribe();
  }

  // login
  login(email: string, password: string): Observable<User> {
    // HTTP POST request
    const body = {
      email: email,
      password: password,
    };

    return this.http
      .post<User>('http://localhost:5000/login', body, {
        withCredentials: true,
      })
      .pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  register(user: User) {
    const body = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      languages_known: user.languages_known,
      languages_learning: user.languages_learning,
      password: user.password,
    };

    console.log(body);

    return this.http.post('http://localhost:5000/register', body, {
      withCredentials: true,
      responseType: 'text',
    });
  }

  logout() {
    return this.http
      .post(
        'http://localhost:5000/logout',
        {},
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(tap(() => this.currentUserSubject.next(null)));
  }

  checkAuth() {
    return this.http.get<boolean>('http://localhost:5000/checkAuth', {
      withCredentials: true,
    });
  }

  checkRole() {
    return this.http.get<string>('http://localhost:5000/checkRole', {
      withCredentials: true
    })
  }

  getProfile() {
    return this.http.get<{ first_name: string; last_name: string }>(
      'http://localhost:5000/profile',
      { withCredentials: true }
    );
  }

  updateProfile(payload: Partial<User>): Observable<User> {
    return this.http
      .put<User>('http://localhost:5000/updateProfile', payload, {
        withCredentials: true,
      })
      .pipe(tap((updated) => this.currentUserSubject.next(updated)));
  }

  getLanguages(): Observable<string[]> {
    return this.http.get<string[]>('http://localhost:5000/languages');
  }

  getClasses(filters?: {
    learnLanguage?: string[];
    speakLanguage?: string[];
    level?: string;
  }): Observable<Class[]> {
    const params: any = {};
    if (filters?.learnLanguage?.length) {
      params.learnLanguage = filters.learnLanguage.join(',');
    }
    if (filters?.speakLanguage?.length) {
      params.speakLanguage = filters.speakLanguage.join(',');
    }
    if (filters?.level) {
      params.level = filters.level;
    }
    return this.http.get<Class[]>('http://localhost:5000/classes', {
      params,
      withCredentials: true,
    });
  }

  enrollInClass(classId: string): Observable<Class> {
    return this.http.put<Class>(
      `http://localhost:5000/class/${classId}/enroll`,
      {},
      { withCredentials: true }
    );
  }

  leaveClass(classId: string): Observable<Class> {
    return this.http.put<Class>(
      `http://localhost:5000/class/${classId}/leave`,
      {},
      { withCredentials: true }
    );
  }
  
  getMentorClasses(id: string): Observable<Class[]> {
    return this.http.get<Class[]>(`http://localhost:5000/mentor/${id}/classes`, { withCredentials: true }).pipe(tap((classes) => {
      classes.forEach((c) => {console.log(c)});}))
  }

  getMyClasses(): Observable<Class[]> {
    return this.http.get<Class[]>('http://localhost:5000/getMyClasses', {
      withCredentials: true,
    });
  }

  getMentors(filters?: { languages?: string[] }): Observable<Mentor[]> {
    const params: any = {};
    if (filters?.languages?.length) {
      params.languages = filters.languages.join(',');
    }
    return this.http.get<Mentor[]>('http://localhost:5000/mentors', {
      params,
      withCredentials: true,
    });
  }

  getMentorById(id: string): Observable<Mentor> {
    return this.http.get<Mentor>(`http://localhost:5000/mentors/${id}`, {
      withCredentials: true,
    });
  }

  kickStudent(classId: string, studentId: string): Observable<Class> {
  return this.http.post<Class>(
    `http://localhost:5000/mentor/class/${classId}/kick/${studentId}`,
    {},
    { withCredentials: true }
  );
}

  getClassById(id: string): Observable<Class> {
    return this.http.get<Class>(`http://localhost:5000/class/${id}`);
  }

  createClass(payload: any): Observable<Class> {
    const body ={
      name: payload.name,
      description: payload.description,
      speak_language: payload.speak_language,
      learn_language: payload.learn_language,
      free_space: payload.free_space,
      startDate: payload.startDate,
      endDate: payload.endDate,
      loc: payload.loc,
      level: payload.level,
      studentsIds: [],
    }
    return this.http.post<Class>(
      `http://localhost:5000/mentor/createClass`,
      body,
      { withCredentials: true }
    );
  }

  deleteClass(id: string): Observable<string> {
    return this.http.post<string>(`http://localhost:5000/mentor/deleteClass/${id}`, {}, {
      withCredentials: true,
    });
  }

  updateClass(classId: string, payload: Partial<Class>): Observable<Class> {
  return this.http.put<Class>(
    `http://localhost:5000/mentor/updateClass/${classId}`,
    payload,
    { withCredentials: true }
  );
}
}
