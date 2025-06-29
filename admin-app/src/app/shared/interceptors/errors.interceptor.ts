import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request).pipe(retry(1), catchError(handleErrors));
};


const handleErrors = (error: HttpErrorResponse) => {
  if (error.error.message) {
    return throwError(() => error.error.message || 'Server error');
  }

  if (error.error.errors) {
    let modelStateErrors = '';

    // for now just concatenate the error descriptions, alternative we could simply pass the entire error response upstream
    for (const errorMsg of error.error.errors) {
      modelStateErrors += errorMsg + '<br/>';
    }
    return throwError(() => modelStateErrors || 'Server error');
  }
  return throwError(() => 'Server error');
};
