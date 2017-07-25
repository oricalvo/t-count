import {ApplicationRef, Inject, InjectionToken, ModuleWithProviders, NgModule} from '@angular/core';
import {PerfCounter} from "./counters/counter";
import {PerfCounterHub} from "./hub";
import {PerfCounterViewer} from "./viewer/viewer";

interface Config {
  counters: PerfCounterFactory[];
  selector: string;
}

const CONFIG_TOKEN = new InjectionToken<Config>("CONFIG");

@NgModule({
})
export class PerfCounterModule {
  viewer: PerfCounterViewer;
  element: HTMLElement;

  constructor(private applicationRef: ApplicationRef,
              private hub: PerfCounterHub,
              @Inject(CONFIG_TOKEN) private config: Config) {
    this.hub.setData("applicationRef", this.applicationRef);

    for(let factory of this.config.counters) {
      const counter = factory();
      if(Array.isArray(counter)) {
        for(let c of counter) {
          this.hub.addCounter(c);
        }
      }
      else {
        this.hub.addCounter(counter);
      }
    }

    if(this.config.selector) {
      const element = document.querySelector(this.config.selector);
      if(!element) {
        throw new Error("PerfCounter viewer's element was not found: " + this.config.selector);
      }

      this.element = element as HTMLElement;
      this.viewer = new PerfCounterViewer(this.hub, this.element);
    }
  }

  static for(counters: PerfCounterFactory[], selector: string): ModuleWithProviders {
    return {
      ngModule: PerfCounterModule,
      providers: [
        {provide: CONFIG_TOKEN, useValue: {counters, selector} as Config},
        PerfCounterHub,
      ]
    };
  }
}

export interface PerfCounterFactory {
  (): PerfCounter|PerfCounter[];
}
