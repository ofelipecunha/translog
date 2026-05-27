export interface LoginResponse {
  idLogin: number;
  nome: string;
  email: string;
  token: string;
  imagem?: string | null;
}
