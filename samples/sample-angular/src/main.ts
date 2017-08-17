import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {profiler} from "./profiling";

profiler.run(() => {
  platformBrowserDynamic().bootstrapModule(AppModule);
});

//platformBrowserDynamic().bootstrapModule(AppModule);
