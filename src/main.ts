import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
//import {unpatch} from "./perfCounters/counter.components";

if (environment.production) {
  enableProdMode();
}

//unpatch();

platformBrowserDynamic().bootstrapModule(AppModule);
