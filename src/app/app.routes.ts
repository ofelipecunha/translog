import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { acessoGuard } from './core/acesso/acesso.guard';
import { TransportadoraDashboardComponent } from './pages/dashboard/transportadora/transportadora-dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { FretesPageComponent } from './pages/transportadora/fretes/fretes-page.component';
import { VeiculosPageComponent } from './pages/transportadora/veiculos/veiculos-page.component';
import { MotoristasPageComponent } from './pages/transportadora/motoristas/motoristas-page.component';
import { ClientesPageComponent } from './pages/transportadora/clientes/clientes-page.component';
import { RotasPageComponent } from './pages/transportadora/rotas/rotas-page.component';
import { UsuariosPageComponent } from './pages/usuarios/usuarios-page.component';
import { EmissaoEtiquetasPageComponent } from './pages/operacoes/emissao-etiquetas/emissao-etiquetas-page.component';
import { ConferenciaVolumesPageComponent } from './pages/operacoes/conferencia-volumes/conferencia-volumes-page.component';
import { CargaDescargaPageComponent } from './pages/operacoes/carga-descarga/carga-descarga-page.component';
import { RotaPageComponent } from './pages/operacoes/rota/rota-page.component';
import { PainelDivergenciaPageComponent } from './pages/operacoes/painel-divergencia/painel-divergencia-page.component';
import { EmpresasPageComponent } from './pages/empresas/empresas-page.component';
import { ControleAcessoPageComponent } from './pages/sistema/controle-acesso/controle-acesso-page.component';

const APP_PAGE_TITLE = 'Translog Transportadora';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard, acessoGuard],
    children: [
      {
        path: '',
        component: TransportadoraDashboardComponent,
        pathMatch: 'full',
        title: APP_PAGE_TITLE,
      },
      {
        path: 'fretes',
        component: FretesPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'veiculos',
        component: VeiculosPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'motoristas',
        component: MotoristasPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'clientes',
        component: ClientesPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'rotas',
        component: RotasPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'calendar',
        component: CalenderComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'operacoes/emissao-etiquetas',
        component: EmissaoEtiquetasPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'operacoes/conferencia-volumes',
        component: ConferenciaVolumesPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'operacoes/carga-descarga',
        component: CargaDescargaPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'operacoes/rota',
        component: RotaPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'operacoes/painel-divergencia',
        component: PainelDivergenciaPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'usuarios',
        component: UsuariosPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'empresas',
        component: EmpresasPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'sistema/controle-acesso',
        component: ControleAcessoPageComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'basic-tables',
        component: BasicTablesComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'line-chart',
        component: LineChartComponent,
        title: APP_PAGE_TITLE,
      },
      {
        path: 'bar-chart',
        component: BarChartComponent,
        title: APP_PAGE_TITLE,
      },
    ],
  },
  {
    path: 'signin',
    component: SignInComponent,
    canActivate: [guestGuard],
    title: APP_PAGE_TITLE,
  },
  {
    path: 'signup',
    component: SignUpComponent,
    canActivate: [guestGuard],
    title: APP_PAGE_TITLE,
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: APP_PAGE_TITLE,
  },
];
