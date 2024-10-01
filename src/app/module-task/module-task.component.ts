import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Task } from './task.model';
import { BehaviorSubject, fromEvent, map, merge, Observable } from 'rxjs';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { TaskService } from './task.service';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { Direction } from '@angular/cdk/bidi';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DatePipe, NgClass } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { MAT_DATE_LOCALE, MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CreateEditComponent } from './dialogs/create-edit/create-edit.component';
import { DeleteComponent } from './dialogs/delete/delete.component';
import { PERMISSIONS } from '@core/models/permisos.medata';
import { AuthService } from '@core/service/auth.service';
import Swal from 'sweetalert2';
import { PermissionsRoles } from '@core/models/permisos.interface';

@Component({
  selector: 'app-module-task',
  standalone: true,
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  imports: [   
        MatTooltipModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatSortModule,
        NgClass,
        MatCheckboxModule,
        FeatherIconsComponent,
        MatRippleModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatPaginatorModule,
        DatePipe,
  ],
  templateUrl: './module-task.component.html',
  styleUrl: './module-task.component.scss'
})
export class ModuleTaskComponent extends UnsubscribeOnDestroyAdapter
implements OnInit {

  displayedColumns = [    
    'nombre_asignado',   
    'nombre_tarea',
    'estado',
    'nota',
    'fecha',    
    'actions',
  ];
  exampleDatabase?: TaskService;
  dataSource!: ExampleDataSource;
  selection = new SelectionModel<Task>(true, []);
  id?: string;
  advanceTable?: Task;
  permissionsRol?: PermissionsRoles;

  breadscrums = [
    {
      title: 'Table',
      items: ['Home'],
      active: 'Table',
    },
  ];
  constructor( public httpClient: HttpClient,
    public dialog: MatDialog,
    public taskService: TaskService,
    private authService: AuthService,
    private snackBar: MatSnackBar) {
    super();    
  }
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  ngOnInit() {
    this.checkPermission();
    this.loadData();
  }
  refresh() {
    this.loadData();
  }
  addNew() {
    if(!this.permissionsRol?.permisos?.add) {
      Swal.fire({
        icon: 'info',
        title: 'No tiene permisos para crear',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }
    let tempDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      tempDirection = 'rtl';
    } else {
      tempDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(CreateEditComponent, {
      data: {
        advanceTable: this.advanceTable,
        action: 'add',
      },
      direction: tempDirection,
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        // After dialog is closed we're doing frontend updates
        // For add we're just pushing a new row inside DataService
        this.exampleDatabase?.dataChange.value.unshift(
          this.taskService.getDialogData()
        );
        this.refresh();
        this.refreshTable();
        this.showNotification(
          'snackbar-success',
          'Tarea Registrada...!!!',
          'bottom',
          'center'
        );
      }
    });
  }
  editCall(row: Task) {
    this.id = row.id;
    let tempDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      tempDirection = 'rtl';
    } else {
      tempDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(CreateEditComponent, {
      data: {
        taskTable: row,
        action: 'edit',
      },
      direction: tempDirection,
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        // When using an edit things are little different, firstly we find record inside DataService by id
        const foundIndex = this.exampleDatabase?.dataChange.value.findIndex(
          (x) => x.id === this.id
        );
        // Then you update that record using data from dialogData (values you enetered)
        if (foundIndex != null && this.exampleDatabase) {
          this.exampleDatabase.dataChange.value[foundIndex] =
            this.taskService.getDialogData();
          // And lastly refresh table
          this.refresh();
          this.refreshTable();
          this.showNotification(
            'black',
            'Edit Record Successfully...!!!',
            'bottom',
            'center'
          );
        }
      }
    });
  }
  deleteItem(row: Task) {
    if(!this.permissionsRol?.permisos?.delete) {
      Swal.fire({
        icon: 'info',
        title: 'No tiene permisos para eliminar',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }
    this.id = row.id;
    let tempDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      tempDirection = 'rtl';
    } else {
      tempDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: row,
      direction: tempDirection,
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        const foundIndex = this.exampleDatabase?.dataChange.value.findIndex(
          (x) => x.id === this.id
        );
        // for delete we use splice in order to remove single object from DataService
        if (foundIndex != null && this.exampleDatabase) {
          this.exampleDatabase.dataChange.value.splice(foundIndex, 1);
          this.refreshTable();
          this.showNotification(
            'snackbar-danger',
            'Registro Eliminado...!!!',
            'bottom',
            'center'
          );
        }
      }
    });
  }
  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.renderedData.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.renderedData.forEach((row) =>
          this.selection.select(row)
        );
  }
  removeSelectedRows() {
    const totalSelect = this.selection.selected.length;
    this.selection.selected.forEach((item) => {
      const index: number = this.dataSource.renderedData.findIndex(
        (d) => d === item
      );
      // console.log(this.dataSource.renderedData.findIndex((d) => d === item));
      this.exampleDatabase?.dataChange.value.splice(index, 1);
      this.refreshTable();
      this.selection = new SelectionModel<Task>(true, []);
    });
    this.showNotification(
      'snackbar-danger',
      totalSelect + ' Record Delete Successfully...!!!',
      'bottom',
      'center'
    );
  }
  public loadData() {
    this.exampleDatabase = new TaskService(this.httpClient);
    this.dataSource = new ExampleDataSource(
      this.exampleDatabase,
      this.paginator,
      this.sort
    );
    this.subs.sink = fromEvent(this.filter.nativeElement, 'keyup').subscribe(
      () => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      }
    );
  }
  // export table data in excel file
  // exportExcel() {
  //   // key name with space add in brackets
  //   const exportData: Partial<TableElement>[] =
  //     this.dataSource.filteredData.map((x) => ({
  //       'First Name': x.fName,
  //       'Last Name': x.lName,
  //       Email: x.email,
  //       Gender: x.gender,
  //       'Birth Date': formatDate(new Date(x.bDate), 'yyyy-MM-dd', 'en') || '',
  //       Mobile: x.mobile,
  //       Address: x.address,
  //       Country: x.country,
  //     }));

  //   TableExportUtil.exportToExcel(exportData, 'excel');
  // }
  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition
  ) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }
  checkPermission() {
    this.permissionsRol = PERMISSIONS.find((permissionRol) =>  permissionRol.rol === this.authService.currentUserValue.rol && permissionRol.codeModule === 'task');
  }

  // context menu
  onContextMenu(event: MouseEvent, item: Task) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }

}
export class ExampleDataSource extends DataSource<Task> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: Task[] = [];
  renderedData: Task[] = [];
  constructor(
    public exampleDatabase: TaskService,
    public paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Task[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.exampleDatabase.dataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.exampleDatabase.getAllAdvanceTables();
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.exampleDatabase.data
          .slice()
          .filter((advanceTable: Task) => {
            const searchStr = (
              advanceTable.nombre_asignado +
              advanceTable.nombre_tarea +
              //advanceTable.estado +
              advanceTable.nota +
              advanceTable.fecha 
              
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());
        // Grab the page's slice of the filtered sorted data.
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.renderedData = sortedData.splice(
          startIndex,
          this.paginator.pageSize
        );
        return this.renderedData;
      })
    );
  }
  disconnect() {
    //disconnect
  }
  /** Returns a sorted copy of the database data. */
  sortData(data: Task[]): Task[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'id':
          [propertyA, propertyB] = [a.id, b.id];
          break;
        case 'nombre_asignado':
          [propertyA, propertyB] = [a.nombre_asignado, b.nombre_asignado];
          break;
        case 'nombre_tarea':
          [propertyA, propertyB] = [a.nombre_tarea, b.nombre_tarea];
          break;
        // case 'estado':
        //   [propertyA, propertyB] = [a.estado, b.estado];
        //   break;
        case 'nota':
          [propertyA, propertyB] = [a.nota, b.nota];
          break;
        case 'fecha':
          [propertyA, propertyB] = [a.fecha, b.fecha];
          break;
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }
}
