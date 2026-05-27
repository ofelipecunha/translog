/** Resposta de GET /api/auth/me (alinhada ao DTO Java PerfilUsuarioResponse). */
export interface PerfilUsuario {
  idLogin: number;
  nome: string;
  login?: string;
  email: string;
  imagem?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  perfil?: string | null;
}

export interface PerfilUsuarioUpdate {
  nome?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
}
