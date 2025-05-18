import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { mentorGuard } from './shared/guards/mentor.guard';
import { adminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./home/home.component').then((c) => c.HomeComponent) },
    { path: 'signup', loadComponent: () => import('./signup/signup.component').then((c) => c.SignupComponent) },
    { path: 'login', loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent) },
    {path: 'mentors', loadComponent: () => import('./mentors/mentors.component').then((c) => c.MentorsComponent)},
    {path: 'mentor/createClass', loadComponent: () => import('./create-class/create-class.component').then((c) => c.CreateClassComponent), canActivate: [mentorGuard]},
    { path: 'mentor/:id', loadComponent: () => import('./mentor-detail/mentor-detail.component').then((c) => c.MentorDetailComponent) },
    {path: 'classes', loadComponent: () => import('./classes/classes.component').then((c) => c.ClassesComponent)},
    {path: 'class/:id', loadComponent: () => import('./class-detail/class-detail.component').then((c) => c.ClassDetailComponent)},
    {path: 'profile', loadComponent: () => import('./profile/profile.component').then((c) => c.ProfileComponent), canActivate: [authGuard]},
    {path: 'profile/edit', loadComponent: () => import('./profile-edit/profile-edit.component').then((c) => c.ProfileEditComponent), canActivate: [authGuard]},
    {path: 'my-classes', loadComponent: () => import('./my-classes/my-classes.component').then((c) => c.MyClassesComponent), canActivate: [authGuard]},
    {path: 'mentor/updateClass/:id', loadComponent: () => import('./update-class/update-class.component').then((c) => c.UpdateClassComponent), canActivate: [mentorGuard]},
    {path: 'admin/userManagement', loadComponent: () => import('./user-management/user-management.component').then((c) => c.UserManagementComponent), canActivate: [adminGuard]},
    {path: 'admin/mentorManagement', loadComponent: () => import('./mentor-management/mentor-management.component').then((c) => c.MentorManagementComponent), canActivate: [adminGuard]},
    {path: 'admin/classManagement', loadComponent: () => import('./class-management/class-management.component').then((c) => c.ClassManagementComponent), canActivate: [adminGuard]},
    {path: 'admin/languageManagement', loadComponent: () => import('./language-management/language-management.component').then((c) => c.LanguageManagementComponent), canActivate: [adminGuard]},
    {path: 'admin/logManagement', loadComponent: () => import('./log-management/log-management.component').then((c) => c.LogManagementComponent), canActivate: [adminGuard]},
    { path: '**', redirectTo: 'login' }
];

