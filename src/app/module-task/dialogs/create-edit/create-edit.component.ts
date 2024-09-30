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
    private fb: UntypedFormBuilder
  ) {
    
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle =
        data.taskTable.nombre_asignado + ' ' + data.taskTable.nombre_tarea;
      this.taskTable = data.taskTable;
    } else {
      this.dialogTitle = 'New Record';
      const blankObject = {} as Task;
      this.taskTable = new Task(blankObject);    }
    
    this.taskTableForm = this.createContactForm();  }
  formControl = new UntypedFormControl('', [
    Validators.required,
    // Validators.email,
  ]);
  ngOnInit() {
    this.getModuleData();   
       
  }
  public getModuleData(){
    this.userService.getAllAdvanceTables();
    this.userService.dataChange.subscribe( s => {
      this.selectDataUser = s;
      this.selectUser = this.selectDataUser.find(
        (x) => x.id === this.taskTable.id_asignado
      );  
      this.selected.setValue(this.selectUser?.id);
      // const moduleCode = this.authService.currentUserValue.moduleCode;
      // this.selectModule = this.selectDataModule.find(
      //   (x) => x.codigoDto === moduleCode
      // );  
      //this.filterDates.moduleCode=this.selectModule?.codigoDto;
      // this.selected.setValue(this.selectModule?.idDto);
      // this.loadData();
      
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
      // lName: [this.userTable.lName, [Validators.required]],
      // email: [
      //   this.userTable.email,
      //   [Validators.required, Validators.email, Validators.minLength(5)],
      // ],
      estado: [this.taskTable.estado],
      fecha: [
        formatDate(this.taskTable.fecha, 'yyyy-MM-dd', 'en'),
        [Validators.required],
      ],
      nota: [this.taskTable.nota],
      // mobile: [this.userTable.mobile, [Validators.required]],
      // country: [this.userTable.country],
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
    // this.userService.addAdvanceTable(
    //   this.userTableForm.getRawValue()
    // );
  }
  public confirmAdd(): void {
    this.taskTable = this.taskTableForm.getRawValue()
    // this.advanceTable.rol = this.selectRol.descripcionDto;
    // this.advanceTable.charge = this.selectCargo.descripcionDto;
    // this.advanceTable.operationCenter = this.selectCentroOperaciones.descripcionDto;
    this.taskService
        .addAdvanceTable(this.taskTable)
        .subscribe(
          (res) => {
            
            if (res.success) {
              // const token = this.authService.currentUserValue.token;
              // if (token) {
              //   this.router.navigate(['/dashboard/main']);
              // }
              this.dialogRef.close(1);
            } else {
              // this.showNotification(
              //   'snackbar-warning',
              //    res.messages,
              //   'bottom',
              //   'center'
              // );
              this.dialogRef.close();
              //this.error = 'Credenciales Invalidas';
            }
          },
          (error) => {
            this.dialogRef.close();  
            // this.showNotification(
            //   'snackbar-danger',
            //   'No se pudo crear el Usuario, Valide con el administrador...!!!',
            //   'bottom',
            //   'center'
            // );         
          }
        );     
  } 
  public confirmEdit(): void {
    this.taskTable = this.taskTableForm.getRawValue()
    // this.advanceTable.rol = this.selectRol.descripcionDto;
    // this.advanceTable.charge = this.selectCargo.descripcionDto;
    // this.advanceTable.operationCenter = this.selectCentroOperaciones.descripcionDto;
    this.taskService
        .updateAdvanceTable(this.taskTable)
        .subscribe(
          (res) => {
            
            if (res.success) {
             
              this.dialogRef.close(1);
            } else {
              // this.showNotification(
              //   'snackbar-warning',
              //    res.messages,
              //   'bottom',
              //   'center'
              // );
              this.dialogRef.close();
            
            }
          },
          (error) => {
            this.dialogRef.close();  
            // this.showNotification(
            //   'snackbar-danger',
            //   'No se pudo crear el Usuario, Valide con el administrador...!!!',
            //   'bottom',
            //   'center'
            // );         
          }
        );    
  } 

}
