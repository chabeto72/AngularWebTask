export class RequestResult<T> {
    statusCode: number;
    success: boolean;
    message: string; 
    data: any;
  
    constructor() {
      this.statusCode = 500;
      this.success = false;
      this.message = '';      
      this.data = null;
    }
  }