import {perfCounters} from "./perfCounters";
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {HttpModule} from "@angular/http";
import {ClockComponent} from './clock/clock.component';
import {ContactItemComponent} from './contact-item/contact-item.component';
import {ContactThunk} from "./app.store";
import {PerfCounterModule} from "../profiler/module";

@NgModule({
  declarations: [
    AppComponent,
    ClockComponent,
    ContactItemComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    PerfCounterModule.for(perfCounters, "profiler"),
  ],
  providers: [
    ContactThunk,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
