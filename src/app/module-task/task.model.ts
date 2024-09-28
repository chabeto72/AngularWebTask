import { formatDate } from '@angular/common';
export class Task {
  id: number;
  img: string;
  fName: string;
  lName: string;
  email: string;
  gender: string;
  bDate: string;
  mobile: string;
  address: string;
  country: string;
  constructor(task: Task) {
    {
      this.id = task.id || this.getRandomID();
      this.img = task.img || 'assets/images/user/user1.jpg';
      this.fName = task.fName || '';
      this.lName = task.lName || '';
      this.email = task.email || '';
      this.gender = task.gender || 'male';
      this.bDate = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
      this.mobile = task.mobile || '';
      this.address = task.address || '';
      this.country = task.country || '';
    }
  }
  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
