import {Component, ElementRef, NgZone} from '@angular/core';
import {appStore, ContactThunk} from "./app.store";
import {Profiler} from "../profiler/core/profiler";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showClock: boolean = true;

  constructor(private contactThunk: ContactThunk, private profiler: Profiler, private ngZone: NgZone, private element: ElementRef) {
  }

  ngOnInit() {
    const buttonReset = this.element.nativeElement.querySelector("button.reset");
    if(buttonReset) {
      this.ngZone.runOutsideAngular(() => {
        buttonReset.addEventListener("click", () => {
          setTimeout(() => {
          }, 0);
        });
      });
    }
  }

  get contacts() {
    return appStore.getState().contacts;
  }

  noop() {
  }

  reload() {
    appStore.dispatch(this.contactThunk.refresh());
  }

  toggleClock() {
    this.showClock = !this.showClock;
  }

  loadContacts() {
    appStore.dispatch(this.contactThunk.loadAll());
  }

  setTimeout() {
    appStore.dispatch(this.contactThunk.wait());
  }
}
