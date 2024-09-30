import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { User } from '../models/user';
import { RequestResult } from './requestResult';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  private users = [
    {
      id: 1,
      documentNumber: '1030525189',
      password: 'admin',
      firstName: 'Ariel',
      lastName: 'Bejarano',
      token: 'admin-token',
    },
  ];

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(userDocumentNumber: string, password: string) {

    //const user = this.users.find((u) => u.documentNumber === userDocumentNumber && u.password === password);

    return this.http
      .get<RequestResult<any>>(`${environment.apiUrl}/user/get-login-password-docummentnumber/${password}/${userDocumentNumber}`)
      .pipe(
        map((requestResult) => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes

          localStorage.setItem('currentUser', JSON.stringify(requestResult.data));
          this.currentUserSubject.next(requestResult.data);
          return requestResult;
        })        
      );

    // if (!user) {
    //   return this.error('Usuario y Contraseña incorrectos');
    // } else {
    //   localStorage.setItem('currentUser', JSON.stringify(user));
    //   this.currentUserSubject.next(user);
    //   return this.ok({
    //     id: user.id,
    //     documentNumber: user.documentNumber,
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     token: user.token,
    //   });
    // }
  }
  ok(body?: {
    id: number;
    documentNumber: string;
    firstName: string;
    lastName: string;
    token: string;
  }) {
    return of(new HttpResponse({ status: 200, body }));
  }
  error(message: string) {
    return throwError(message);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(this.currentUserValue);
    return of({ success: false });
  }
}
