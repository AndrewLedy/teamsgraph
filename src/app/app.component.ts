import { Component, OnInit } from '@angular/core';
import { delay } from 'rxjs/operator/delay';
import { UsersService } from './users.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UsersService]
})
export class AppComponent implements OnInit{

  users: any =[];
  public msg:string;
  constructor(private userService:UsersService) {
  
}

ngOnInit(){
  setInterval(()=>{
    this.userService.getAllUsers().subscribe(users=>{
      this.users=users;
      console.log(users)
  });
  },10000);
}
onKeypressEvent(event: any)
{
  this.msg=event.target.value;
  console.log(event.target.value);
}
}
