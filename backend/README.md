# TransLog Backend

API Java (Spring Boot 4) para o frontend Angular da transportadora TransLog.

## Pré-requisitos

- Java 17+
- Maven 3.9+
- PostgreSQL

## Banco de dados

Crie o banco antes de subir a API:

```sql
CREATE DATABASE transportadora;
```

Ajuste usuário/senha em `src/main/resources/application.properties` se necessário.

## Executar

```bash
cd backend
mvn spring-boot:run
```

A API sobe em `http://localhost:8080`.

## Autenticação

### POST `/api/auth/login`

**Request**

```json
{
  "email": "admin@translog.com.br",
  "senha": "123456"
}
```

**Response (200)**

```json
{
  "idLogin": 1,
  "nome": "Administrador",
  "email": "admin@translog.com.br",
  "token": "<token-opaco>",
  "imagem": null
}
```

### GET `/api/auth/me`

Cabeçalho: `Authorization: Bearer <token>`

## Usuário inicial

Na primeira execução, se a tabela `usuarios` estiver vazia, é criado automaticamente:

| Campo | Valor |
|-------|-------|
| E-mail | `admin@translog.com.br` |
| Login | `admin` |
| Senha | `123456` |

Configure em `application.properties` (`app.seed.*`) ou desative com `app.seed.enabled=false`.

## Integração com o frontend

O Angular consome `http://localhost:8080/api/auth/login` e grava o token retornado em `sessionStorage`.

URLs configuradas em `src/environments/environment.ts`:

- `apiUrl`: `http://localhost:8080`
- `authLoginUrl`: `http://localhost:8080/api/auth/login`
- `authMeUrl`: `http://localhost:8080/api/auth/me`

## Estrutura

```
backend/
├── pom.xml
└── src/main/java/com/translog/backend/
    ├── config/          Security, CORS, erros REST
    ├── controller/      AuthController
    ├── service/         AuthService
    ├── repository/      UsuarioRepository
    ├── entity/          Usuario
    ├── dto/             LoginRequest, LoginResponse
    └── bootstrap/       UsuarioDataSeeder
```

## Migrações

Flyway aplica `V1__usuarios.sql` com a tabela `usuarios`.
