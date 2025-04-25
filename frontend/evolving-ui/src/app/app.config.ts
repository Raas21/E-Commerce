import { ApplicationConfig } from '@angular/core';
       import { provideAnimations } from '@angular/platform-browser/animations';
       import { provideNativeDateAdapter } from '@angular/material/core';

       export const appConfig: ApplicationConfig = {
           providers: [
               provideAnimations(),
               provideNativeDateAdapter()
           ]
       };