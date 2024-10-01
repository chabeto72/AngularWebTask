import { formatDate } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '@core/service/auth.service';
import { Task } from 'app/module-task/task.model';
// import { DialogData } from 'app/advance-table/dialogs/form-dialog/form-dialog.component';
import { TaskService } from 'app/module-task/task.service';
import { User } from 'app/module-user/user.model';
import { UserService } from 'app/module-user/user.service';
export interface DialogData {
  id: number;
  action: string;
  taskTable: Task;
}

@Component({
  selector: 'app-create-edit',
  standalone: true,
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogClose,
],
  templateUrl: './create-edit.component.html',
  styleUrl: './create-edit.component.scss'
})
export class CreateEditComponent {
  currentRol: string = 'EMP';
  action: string;
  dialogTitle: string;
  taskTableForm: UntypedFormGroup;
  taskTable: Task;
  selectUser?: User;
  selectDataUser : User[]=[]; 
  
  selected = new UntypedFormControl('');
 
  constructor(
    public dialogRef: MatDialogRef<CreateEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public taskService: TaskService,
    public userService: UserService,
    private authService: AuthService,
    private fb: UntypedFormBuilder
  ) {
    
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle =
        data.taskTable.nombre_asignado + ' ' + data.taskTable.nombre_tarea;
      this.taskTable = data.taskTable;
    } else {
      this.dialogTitle = 'Nueva tarea';
      const blankObject = {} as Task;
      this.taskTable = new Task(blankObject);    }
    
    this.taskTableForm = this.createContactForm();  }
  formControl = new UntypedFormControl('', [
    Validators.required,    
  ]);
  ngOnInit() {
    this.currentRol = this.authService.currentUserValue.rol;
    this.getModuleData();  
    this.checkUserPermissions(); 
       
  }
  public getModuleData(){
    this.userService.getAllAdvanceTables();
    this.userService.dataChange.subscribe( s => {
      this.selectDataUser = s;
      this.selectUser = this.selectDataUser.find(
        (x) => x.id === this.taskTable.id_asignado
      );  
      this.selected.setValue(this.selectUser?.id);      
      
    }); 
  }
  getErrorMessage() {
    return this.formControl.hasError('required')
      ? 'Required field'
      : this.formControl.hasError('email')
      ? 'Not a valid email'
      : '';
  }
  createContactForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.taskTable.id],
      id_asignado: [this.taskTable.id_asignado],
      nombre: [this.taskTable.nombre_asignado],
      nombre_tarea: [this.taskTable.nombre_tarea, [Validators.required]],     
      estado: [this.taskTable.estado],
      fecha: [
        formatDate(this.taskTable.fecha, 'yyyy-MM-dd', 'en'),
        [Validators.required],
      ],
      nota: [this.taskTable.nota],    
    });
  }
  optionUserChangeSelected(event: any) {
    // datos Module
    if(event)
    {   
      this.selectUser = this.selectDataUser.find(
        (x) => x.id === event.value
      ); 
      this.taskTable.nombre_asignado = this.selectUser?.nombre|| '';
      this.taskTable.id_asignado = event.value;
      this.selected.setValue(event.value);       
    
    }
       
  }
  submit() {
    // emppty stuff
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  public confirmAddEdit(): void {
    if (this.action === 'edit') {
      this.confirmEdit();
    } else {
      this.confirmAdd();
    }   
  }
  public confirmAdd(): void {
    this.taskTable = this.taskTableForm.getRawValue()
   
    this.taskService
        .addAdvanceTable(this.taskTable)
        .subscribe(
          (res) => {
            
            if (res.success) {            
              this.dialogRef.close(1);
            } else {              
              this.dialogRef.close();          
            }
          },
          (error) => {
            this.dialogRef.close();                   
          }
        );     
  } 
  public confirmEdit(): void {
    this.taskTable = this.taskTableForm.getRawValue()
    this.taskService
        .updateAdvanceTable(this.taskTable)
        .subscribe(
          (res) => {
            
            if (res.success) {
             
              this.dialogRef.close(1);
            } else {              
              this.dialogRef.close();
            
            }
          },
          (error) => {
            this.dialogRef.close();  
                   
          }
        );    
  } 
  checkUserPermissions() {
    switch(this.currentRol){
      case"EMP":
      this.taskTableForm.get('nombre_tarea')?.disable();
      this.taskTableForm.get('nota')?.disable();
      this.taskTableForm.get('fecha')?.disable();
      this.taskTableForm.get('id_asignado')?.disable();
      break;
      case"SUP":
      this.taskTableForm.get('nombre_tarea')?.disable();
      this.taskTableForm.get('nota')?.disable();
      this.taskTableForm.get('fecha')?.disable();      
      break;
      default:
        break;
    }  
  }

}
