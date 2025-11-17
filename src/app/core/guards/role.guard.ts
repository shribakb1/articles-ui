import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


export const userGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user && user.role === 'USER') {
    return true; 
  }
  
  return router.parseUrl('/dashboard');
};

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user && user.role === 'ADMIN') {
    return true;
  }

  return router.parseUrl('/dashboard');
};