import {BrowserModule} from '@angular/platform-browser';
import {ApplicationRef, NgModule, NgZone} from '@angular/core';
import {AppComponent} from './app.component';
import {counters} from "../profiling";
import {Http, HttpModule} from "@angular/http";

@NgModule({
  declarations: [
    AppComponent
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
    //counters.changeDetection.patchAngular(applicationRef, ngZone);
    //counters.http.patchAngular(http, ngZone);
    counters.xhr.init(ngZone);

    let counter = 0;

    const tick = applicationRef.tick
    applicationRef.tick = function() {
      console.log(++counter);

      return tick.apply(this, arguments);
    }
  }
}
