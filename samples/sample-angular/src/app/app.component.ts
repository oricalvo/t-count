import { Component } from '@angular/core';
import {Http} from "@angular/http";
import "rxjs/add/operator/map";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(private http: Http) {
  }

  noop() {
  }

  runHttp() {
    this.http.get("assets/contacts.json").subscribe(contacts => {
      console.log(contacts);
    });
  }
}
