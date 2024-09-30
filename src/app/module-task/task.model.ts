import { formatDate } from '@angular/common';
export class Task {

    // "id_asignado": "2",  
    // "nombre_asignado": "Sarah Smith",
    // "nombre_tarea": "Autorizacion",
    // "estado": true,
    // "nota": "autorizacion de entrada",  
    // "fecha": "2024-02-25T14:22:18Z"
  id: string;
  id_asignado: number;
  nombre_asignado: string;
  nombre_tarea: string;
  estado: boolean;
  nota: string;
  fecha: string;
 
  constructor(task: Task) {
    {
      this.id = task.id || '';  
      this.id_asignado = task.id_asignado || this.getRandomID();
      this.nombre_asignado = task.nombre_asignado || '';
      this.nombre_tarea = task.nombre_tarea || '';
      this.estado = task.estado || false;
      this.nota = task.nota || '';
      this.fecha = formatDate(new Date(), 'yyyy-MM-dd', 'en') || ''; 
    }
  }
  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
