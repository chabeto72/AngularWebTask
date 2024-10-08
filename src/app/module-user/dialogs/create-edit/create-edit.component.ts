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
import { User } from 'app/module-user/user.model';
import { UserService } from 'app/module-user/user.service';
import { invalid } from 'moment';
export interface DialogData {
  id: number;
  action: string;
  userTable: User;
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
  saveRol: boolean = true;
  dialogTitle: string;
  userTableForm: UntypedFormGroup;
  userTable: User;
  selectUser?: User;
  selectDataUser : User[]=[]; 
  selected = new UntypedFormControl('');
  constructor(
    public dialogRef: MatDialogRef<CreateEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private authService: AuthService,
    public userService: UserService,
    private fb: UntypedFormBuilder
  ) {
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle =
        data.userTable.nombre + ' ' + data.userTable.rol;
      this.userTable = data.userTable;
    } else {
      this.dialogTitle = 'New Record';
      const blankObject = {} as User;
      this.userTable = new User(blankObject);
    }
    this.userTableForm = this.createContactForm();
  }
  formControl = new UntypedFormControl('', [
    Validators.required,
    // Validators.email,
  ]);
  getErrorMessage() {
    return this.formControl.hasError('required')
      ? 'Required field'
      : this.formControl.hasError('email')
      ? 'Not a valid email'
      : '';
  }
  createContactForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.userTable.id],
      nombre: [this.userTable.nombre, [Validators.required]],
      correo: [
        this.userTable.correo,
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      documento: [this.userTable.documento, [Validators.required]],
      codigo_rol: [this.userTable.codigo_rol],
      rol: [this.userTable.rol],
      direccion: [this.userTable.direccion]     
    });
  }
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
        (x) => x.id === this.userTable.id
      );  
      this.selected.setValue(this.selectUser?.id);      
      
    }); 
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
    this.userTable = this.userTableForm.getRawValue()
    // this.advanceTable.rol = this.selectRol.descripcionDto;
    // this.advanceTable.charge = this.selectCargo.descripcionDto;
    // this.advanceTable.operationCenter = this.selectCentroOperaciones.descripcionDto;
    this.userService
        .addAdvanceTable(this.userTable)
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
    this.userTable = this.userTableForm.getRawValue()
    this.userService
        .updateAdvanceTable(this.userTable)
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
      this.userTableForm.get('nombre')?.disable();
      this.userTableForm.get('correo')?.disable();
      this.userTableForm.get('documento')?.disable();
      this.userTableForm.get('codigo_rol')?.disable();
      this.userTableForm.get('rol')?.disable();
      this.userTableForm.get('direccion')?.disable();
      this.saveRol = false;  
      break;
      case"SUP":
      this.userTableForm.get('nombre')?.disable();
      this.userTableForm.get('correo')?.disable();
      this.userTableForm.get('documento')?.disable();
      this.userTableForm.get('codigo_rol')?.disable();
      this.userTableForm.get('rol')?.disable();
      this.userTableForm.get('direccion')?.disable();  
      this.saveRol = false;  
      break;
      default:
        break;
    }  
  }

}
