import { Injectable } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { BehaviorSubject, catchError, map, throwError } from 'rxjs';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from './user.model';
import { RequestResult } from '@core/service/requestResult';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService extends UnsubscribeOnDestroyAdapter{

  private readonly API_URL = 'assets/data/user.json';
  isTblLoading = true;
  dataChange: BehaviorSubject<User[]> = new BehaviorSubject<
  User[]
  >([]);
  // Temporarily stores data from dialogs
  dialogData!: User;
  constructor(private httpClient: HttpClient) {
    super();
  }
  get data(): User[] {
    return this.dataChange.value;
  }
  getDialogData() {
    return this.dialogData;
  }
  /** CRUD METHODS */
  getAllAdvanceTables(): void {
    this.subs.sink = this.httpClient
      .get<RequestResult<User[]>>(`${environment.apiUrl}/user/get-all`)
      .subscribe(
        (request) => {
          this.isTblLoading = false;
          this.dataChange.next(request.data);
        },
        (error: HttpErrorResponse) => {
          this.isTblLoading = false;
          console.log(error.name + ' ' + error.message);
        }
      );
  }
  addAdvanceTable(advanceTable: User) {
    this.dialogData = advanceTable;
    return this.httpClient
    .post<RequestResult<User[]>>(`${environment.apiUrl}/user/create`,advanceTable)
    .pipe(
      map((requestResult) => {
        this.isTblLoading = false;
        advanceTable.id = requestResult.data.id;
        this.dialogData = advanceTable;
        return requestResult;
      }),
      catchError(this.errorHandler)
    );
  }
  updateAdvanceTable(advanceTable: User){
    
    return this.httpClient
      .put<RequestResult<User[]>>(`${environment.apiUrl}/user/update`,advanceTable)
      .pipe(
        map((requestResult) => {
          this.isTblLoading = false;
          advanceTable.id = requestResult.data.id;
          this.dialogData = advanceTable;
          return requestResult;
        }),
        catchError(this.errorHandler)
      );

    // return this.httpClient
    //   .post<RequestResult<User>>(`${environment.apiUrl}/Api/User/UpdateUser`, advanceTable)
    //   .pipe(
    //     map((requestResult) => {
    //       this.isTblLoading = false;
    //       advanceTable.id = requestResult.data.id;
    //       this.dialogData = advanceTable;
    //       return requestResult;
    //     }),
    //     catchError(this.errorHandler)
    //   );

    /* this.httpClient.put(this.API_URL + advanceTable.id, advanceTable).subscribe(data => {
      this.dialogData = advanceTable;
    },
    (err: HttpErrorResponse) => {
      // error code here
    }
  );*/
  }
  deleteAdvanceTable(id: number): void {
    console.log(id);
    this.subs.sink = this.httpClient
      .delete<RequestResult<boolean>>(`${environment.apiUrl}/user/delete/${id}`)
      .subscribe(
        (request) => {
          this.isTblLoading = false;
          this.dataChange.next(request.data);
        },
        (error: HttpErrorResponse) => {
          this.isTblLoading = false;
          console.log(error.name + ' ' + error.message);
        }
      );

    /*  this.httpClient.delete(this.API_URL + id).subscribe(data => {
      console.log(id);
      },
      (err: HttpErrorResponse) => {
         // error code here
      }
    );*/
  }
  errorHandler(error:any) {
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

}
