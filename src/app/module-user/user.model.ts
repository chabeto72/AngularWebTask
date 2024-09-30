import { formatDate } from '@angular/common';
export class User {
    id: number;    
    nombre: string; 
    correo: string;   
    direccion: string; 
    documento: string; 
    codigo_rol: string; 
    rol: string;  
  constructor(user: User) {
    {
      this.id = user.id || this.getRandomID();      
      this.nombre = user.nombre || '';     
      this.correo = user.correo || '';
      this.direccion = user.direccion || '';
      //this.bDate = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
      this.documento = user.documento || '';
      this.codigo_rol = user.codigo_rol || '';
      this.rol = user.rol || '';
    }
  }
  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
