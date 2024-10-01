import { PermissionsRoles } from "./permisos.interface";


export const PERMISSIONS: PermissionsRoles[] = [
  {
    codeModule: 'user',
    rol: 'ADM',
    permisos: { edit: true, delete: true, add: true },
  },
  {
    codeModule: 'user',
    rol: 'EMP',
    permisos: { edit: true, delete: false, add: false },
  },
  {
    codeModule: 'user',
    rol: 'SUP',
    permisos: { edit: true, delete: false, add: false },
  },
  {
    codeModule: 'task',
    rol: 'ADM',
    permisos: { edit: true, delete: true, add: true },
  },
  {
    codeModule: 'task',
    rol: 'EMP',
    permisos: { edit: true, delete: false, add: false },
  },
  {
    codeModule: 'task',
    rol: 'SUP',
    permisos: { edit: true, delete: false, add: false },
  }
];
