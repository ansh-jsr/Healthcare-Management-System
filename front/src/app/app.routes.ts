import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { PublicGuard } from './guards/public.guard';
import { PatientRecords } from './pages/patient-records/patient-records.component';
import { NewPatientComponent } from './pages/new-patient/new-patient.component';
import { PatientDetail } from './pages/patient-detail/patient-detail.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { HelpSupportComponent } from './pages/help-support/help-support.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SignUpComponent } from './pages/signup/signup.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BlogComponent } from './pages/blog/blog.component';
import { FaqComponent } from './pages/faq/faq.component';
import { Appointments } from './pages/appointment/appointment.component';
import { UploadRecordComponent } from './pages/upload/upload.component';
import { Appoinment } from './pages/check appointments/appoinment.component';
import { NotificationComponent } from './pages/noti/noti.component';
import { PendingRecordsComponent } from './pages/pending/pending.component';
import { DocumentComponent } from './pages/document/document.component';

export const routes: Routes = [{ path: '', component: LandingPageComponent },
{ path: 'login', component: LoginComponent },
{ path: 'register', component: SignUpComponent},

{
  path: 'dashboard',
  component: DashboardLayoutComponent,
  canActivate: [AuthGuard],  // 🔐 Protected
  children: [
    { path: '', component: DashboardComponent },
    { path: 'patients', component: PatientRecords },
    { path: 'patients/new', component: NewPatientComponent },
    { path: 'patients/:id', component: PatientDetail },
    { path: 'profile', component: ProfilePageComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'help-support', component: HelpSupportComponent },
    { path: 'faq', component: FaqComponent },
    { path : 'blog', component: BlogComponent },
    { path : 'appointments', component: Appointments },
    { path: 'upload', component: UploadRecordComponent },
    { path: 'appoinment', component: Appoinment },
    {path : 'noti', component: NotificationComponent},
    {path : 'pending', component: PendingRecordsComponent},
    {path : 'document', component : DocumentComponent},
  ],
},

{ path: '**', component: NotFoundComponent }
];