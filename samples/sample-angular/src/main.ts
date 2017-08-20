import {profiler} from "./profiling";
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';

profiler.run(() => {
  platformBrowserDynamic().bootstrapModule(AppModule);
});

//platformBrowserDynamic().bootstrapModule(AppModule);
