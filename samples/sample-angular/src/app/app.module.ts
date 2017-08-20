import {BrowserModule} from '@angular/platform-browser';
import {ApplicationRef, NgModule, NgZone} from '@angular/core';
import {AppComponent} from './app.component';
import {counters} from "../profiling";
import {Http, HttpModule} from "@angular/http";
import { ClockComponent } from './clock/clock.component';

@NgModule({
  declarations: [
    AppComponent,
    ClockComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(applicationRef: ApplicationRef, http: Http, ngZone: NgZone) {
    counters.changeDetection.init(applicationRef, <any>ngZone);
    counters.http.init(<any>http, <any>ngZone);
    counters.xhr.init(<any>ngZone);
  }
}
