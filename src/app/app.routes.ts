import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { userGuard, adminGuard } from './core/guards/role.guard'; 

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard] 
  },
  {
    path: 'articles',
    loadComponent: () => import('./features/articles/article-list/article-list.component').then(m => m.ArticleListComponent),
    canActivate: [authGuard] 
  },
  {
    path: 'articles/upload',
    loadComponent: () => import('./features/articles/article-upload/article-upload.component').then(m => m.ArticleUploadComponent),
    canActivate: [authGuard, userGuard]
  },
  {
    path: 'articles/:id',
    loadComponent: () => import('./features/articles/article-detail/article-detail.component').then(m => m.ArticleDetailComponent),
    canActivate: [authGuard] 
  },
  // (Example of an Admin-only route)
  // {
  //   path: 'admin-panel',
  //   loadComponent: () => import('./pages/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
  //   canActivate: [authGuard, adminGuard] // Must be logged in AND be an 'Admin'
  // },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  }
];