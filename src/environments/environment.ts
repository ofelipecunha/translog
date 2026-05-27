const apiUrl = 'http://localhost:8080';
const authLoginPath = '/api/auth/login';
const authMePath = '/api/auth/me';
const authPerfilPath = '/api/auth/perfil';

export const environment = {
  production: false,

  apiUrl,
  authLoginPath,
  authMePath,
  authPerfilPath,
  authLoginUrl: `${apiUrl}${authLoginPath}`,
  authMeUrl: `${apiUrl}${authMePath}`,
  authPerfilUrl: `${apiUrl}${authPerfilPath}`,
  authImagemUrl: `${apiUrl}/api/auth/imagem`,

  pierreApiUrl: '',
  pierreApiKey: '',

  sessionStorageKeys: {
    token: 'translog_auth_token',
    user: 'translog_auth_user',
  },

  idleTimeoutMs: 30 * 60 * 1000,

  fretesApiUrl: `${apiUrl}/api/fretes`,
  veiculosApiUrl: `${apiUrl}/api/veiculos`,
  motoristasApiUrl: `${apiUrl}/api/motoristas`,
  clientesApiUrl: `${apiUrl}/api/clientes`,
  rotasApiUrl: `${apiUrl}/api/rotas`,
  calendarioEventosApiUrl: `${apiUrl}/api/calendario-eventos`,

  formasPagamentoApiUrl: `${apiUrl}/api/formas-pagamento`,
  categoriasApiUrl: `${apiUrl}/api/categorias`,
  usuariosApiUrl: `${apiUrl}/api/usuarios`,
  empresasApiUrl: `${apiUrl}/api/empresas`,
  emissaoEtiquetasApiUrl: `${apiUrl}/api/emissao-etiquetas`,
  lancamentosApiUrl: `${apiUrl}/api/lancamentos`,
  lancamentosCategoriaStreamingIds: [] as readonly number[],
};
