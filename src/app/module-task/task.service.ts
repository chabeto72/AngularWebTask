import { Injectable } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { BehaviorSubject, catchError, map, throwError } from 'rxjs';
import { Task } from './task.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'environments/environment';
import { RequestResult } from '@core/service/requestResult';

@Injectable({
  providedIn: 'root'
})
export class TaskService extends UnsubscribeOnDestroyAdapter{

  private readonly API_URL = 'assets/data/taskV1.json';
  isTblLoading = true;
  dataChange: BehaviorSubject<Task[]> = new BehaviorSubject<
  Task[]
  >([]);
  // Temporarily stores data from dialogs
  dialogData!: Task;
  constructor(private httpClient: HttpClient) {
    super();
  }
  get data(): Task[] {
    return this.dataChange.value;
  }
  getDialogData() {
    return this.dialogData;
  }
  /** CRUD METHODS */
  getAllAdvanceTables(): void {
    this.subs.sink = this.httpClient
    .get<RequestResult<Task[]>>(`${environment.apiUrl}/task/get-all`)
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
  addAdvanceTable(advanceTable: Task) {
    this.dialogData = advanceTable;
    return this.httpClient
    .post<RequestResult<Task[]>>(`${environment.apiUrl}/task/create`,advanceTable)
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
  updateAdvanceTable(advanceTable: Task){
    return this.httpClient
      .put<RequestResult<Task[]>>(`${environment.apiUrl}/task/update`,advanceTable)
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
  deleteAdvanceTable(id: number): void {
    console.log(id);

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
