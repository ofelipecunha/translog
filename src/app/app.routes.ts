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
        title: 'Dashboard | TransLog Transportadora',
      },
      {
        path: 'fretes',
        component: FretesPageComponent,
        title: 'Fretes | TransLog Transportadora',
      },
      {
        path: 'veiculos',
        component: VeiculosPageComponent,
        title: 'Veículos | TransLog Transportadora',
      },
      {
        path: 'motoristas',
        component: MotoristasPageComponent,
        title: 'Motoristas | TransLog Transportadora',
      },
      {
        path: 'clientes',
        component: ClientesPageComponent,
        title: 'Clientes | TransLog Transportadora',
      },
      {
        path: 'rotas',
        component: RotasPageComponent,
        title: 'Rotas | TransLog Transportadora',
      },
      {
        path: 'calendar',
        component: CalenderComponent,
        title: 'Calendário | TransLog Transportadora',
      },
      {
        path: 'operacoes/emissao-etiquetas',
        component: EmissaoEtiquetasPageComponent,
        title: 'Emissão de ET. | TransLog Transportadora',
      },
      {
        path: 'operacoes/conferencia-volumes',
        component: ConferenciaVolumesPageComponent,
        title: 'Conferência de Vol. | TransLog Transportadora',
      },
      {
        path: 'operacoes/carga-descarga',
        component: CargaDescargaPageComponent,
        title: 'Carga e Descarga | TransLog Transportadora',
      },
      {
        path: 'operacoes/rota',
        component: RotaPageComponent,
        title: 'Rota | TransLog Transportadora',
      },
      {
        path: 'operacoes/painel-divergencia',
        component: PainelDivergenciaPageComponent,
        title: 'Painel de Divergência | TransLog Transportadora',
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Perfil | TransLog Transportadora',
      },
      {
        path: 'usuarios',
        component: UsuariosPageComponent,
        title: 'Usuários | TransLog Transportadora',
      },
      {
        path: 'empresas',
        component: EmpresasPageComponent,
        title: 'Empresas | TransLog Transportadora',
      },
      {
        path: 'sistema/controle-acesso',
        component: ControleAcessoPageComponent,
        title: 'Controle de Acesso | TransLog Transportadora',
      },
      {
        path: 'basic-tables',
        component: BasicTablesComponent,
        title: 'Tabelas | TransLog Transportadora',
      },
      {
        path: 'line-chart',
        component: LineChartComponent,
        title: 'Gráfico de linha | TransLog Transportadora',
      },
      {
        path: 'bar-chart',
        component: BarChartComponent,
        title: 'Gráfico de barras | TransLog Transportadora',
      },
    ],
  },
  {
    path: 'signin',
    component: SignInComponent,
    canActivate: [guestGuard],
    title: 'Entrar | TransLog Transportadora',
  },
  {
    path: 'signup',
    component: SignUpComponent,
    canActivate: [guestGuard],
    title: 'Cadastro | TransLog Transportadora',
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Página não encontrada | TransLog Transportadora',
  },
];
