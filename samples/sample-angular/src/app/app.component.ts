import { Component } from '@angular/core';
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  showClock: boolean;

  constructor(private http: Http) {
    this.showClock = true;
  }

  noop() {
  }

  async runHttp() {
    await this.http.get("assets/contacts.json").toPromise();

    setTimeout(() => {
      console.log("timeout");

      this.showClock = !this.showClock;
    }, 1000);
  }
}
