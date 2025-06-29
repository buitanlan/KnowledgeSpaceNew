import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { RouterModule } from '@angular/router';
import { appRoutes } from '@app/app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authInterceptor } from '@app/shared/interceptors/jwt.interceptor';
import { errorInterceptor } from '@app/shared/interceptors/errors.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NotificationService } from '@app/shared/services/notification.service';
import { DatePipe } from '@angular/common';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom([RouterModule.forRoot(appRoutes), BrowserAnimationsModule]),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    MessageService,
    NotificationService,
    ConfirmationService,
    DatePipe
  ]
};
