# Deploy do backend no Render

Guia para publicar a API Spring Boot (`backend/`) e conectar ao frontend na Vercel (`https://translog-orpin.vercel.app`).

## Local (DBeaver) × Render (nuvem)

São bancos **diferentes**. Não use `transportadora` / `postgres` / `123` no Render.

| Onde | Banco | Usuário | Senha |
|------|--------|---------|--------|
| **Seu PC (DBeaver)** | `transportadora` | `postgres` | `123` |
| **Render (`translog-db`)** | `translog_db_ibdf` | `translog_db_ibdf_user` | senha gerada pelo Render (ícone 👁 em **Connections**) |

O `application.properties` do projeto continua com `localhost` + `transportadora` só para desenvolvimento local.  
No Render, as credenciais vão em **Environment Variables** do Web Service (perfil `prod`).

### Seu Postgres `translog-db` (copiar do painel Render)

Na aba **Info → Connections**, use estes campos (hostname pode variar — copie o seu):

| Campo Render | Valor no seu serviço |
|--------------|----------------------|
| Hostname | `dpg-…-a` (copie o seu) |
| Port | `5432` |
| Database | `translog_db_ibdf` |
| Username | `translog_db_ibdf_user` |
| Password | clique em 👁 e copie |

**URL JDBC** para colar em `SPRING_DATASOURCE_URL`:

```text
jdbc:postgresql://SEU-HOSTNAME:5432/translog_db_ibdf
```

Exemplo (troque o host pelo que aparece no seu painel):

```text
jdbc:postgresql://dpg-c8hbwvgg4nts73fe04eg-a:5432/translog_db_ibdf
```

> API e banco no **mesmo workspace Render**: prefira **Internal Database URL** no Web Service (botão **Connect** no Postgres) e converta para JDBC: `jdbc:` + host + porta + `/translog_db_ibdf`.

O usuário **Felipe** que você criou no DBeaver **não existe** no banco da nuvem até você exportar/importar ou logar com o admin do seed (`admin@translog.com.br` / `123456`).

---

## 1. Criar banco PostgreSQL no Render

1. No dashboard Render: **+ New** → **Postgres**
2. Nome sugerido: `translog-db`
3. Região: mesma do Web Service (ex.: Oregon)
4. Plano **Free** (ok para testes)
5. Crie e aguarde ficar **Available**
6. Na aba **Info**, copie:
   - **Internal Database URL** (uso entre serviços Render)
   - **Hostname**, **Port**, **Database**, **Username**, **Password**

Monte a URL JDBC (formato Spring):

```text
jdbc:postgresql://HOST:PORTA/NOME_DO_BANCO
```

Exemplo: `jdbc:postgresql://dpg-xxxxx-a.oregon-postgres.render.com:5432/translog_abc1`

---

## 2. Criar Web Service (API Java)

1. **+ New** → **Web Service**
2. Conecte o repositório GitHub `ofelipecunha/translog`
3. Configurações:

| Campo | Valor |
|--------|--------|
| **Name** | `translog-api` (ou outro) |
| **Region** | Igual ao Postgres |
| **Root Directory** | `backend` |
| **Language / Runtime** | **Java** (não Node — o repo tem `package.json` na raiz) |
| **Branch** | `main` |
| **Build Command** | `mvn clean package -DskipTests` |
| **Start Command** | `java -jar target/translog-backend-0.0.1-SNAPSHOT.jar` |

4. **Instance type**: Free (pode “dormir” após inatividade — primeiro acesso demora ~1 min)

### Health Check (opcional)

- **Health Check Path**: `/api/auth`  
  (GET simples; evita falha de deploy por rota inexistente)

---

## 3. Variáveis de ambiente (Environment)

No Web Service → **Environment** → adicione:

| Key | Value |
|-----|--------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://SEU-HOST:5432/translog_db_ibdf` |
| `SPRING_DATASOURCE_USERNAME` | `translog_db_ibdf_user` |
| `SPRING_DATASOURCE_PASSWORD` | senha do painel Connections (não é `123`) |
| `APP_CORS_ALLOWED_ORIGINS` | `https://translog-orpin.vercel.app,https://translog-git-main-felipe-cunha-s-projects.vercel.app,http://localhost:4200` |
| `APP_SEED_ENABLED` | `true` (só na primeira vez; depois pode `false`) |
| `JAVA_VERSION` | `17` |

> **Dica:** Se criou o Postgres no mesmo workspace, use **Link Resource** para injetar credenciais automaticamente e ajuste só a URL para o prefixo `jdbc:`.

Clique **Save, rebuild, and deploy**.

---

## 4. Conferir se a API subiu

URL do serviço (ex.): `https://translog-api.onrender.com`

No navegador ou Postman:

```http
GET https://SUA-URL.onrender.com/api/auth
```

Login (usuário criado pelo seed na 1ª execução):

```http
POST https://SUA-URL.onrender.com/api/auth/login
Content-Type: application/json

{
  "email": "admin@translog.com.br",
  "senha": "123456"
}
```

---

## 5. Conectar o frontend (Vercel)

1. Abra `src/environments/environment.prod.ts`
2. Troque `apiUrl` pela URL real do Render (sem barra no final):

```ts
const apiUrl = 'https://translog-api.onrender.com';
```

3. Commit + push → a Vercel faz redeploy automático

**Login padrão após seed:** `admin@translog.com.br` / `123456`

---

## 6. Problemas comuns

| Sintoma | Solução |
|---------|---------|
| `mvn: command not found` + log **Using Node.js** | O serviço está como **Node**, não Java. Em **Settings** do `translog-api`: **Language/Runtime → Java**, **Root Directory → `backend`**, **JAVA_VERSION → 17**. Salve e **Manual Deploy**. |
| CORS no login | Confira `APP_CORS_ALLOWED_ORIGINS` com a URL exata da Vercel (com `https://`) |
| 502 / timeout no Render | Plano free “acorda” devagar; espere e tente de novo |
| Erro de banco / Flyway | Confira JDBC URL, usuário e senha; Postgres precisa estar **Available** |
| Frontend chama `localhost` | Build de produção deve usar `environment.prod.ts` (já configurado no `angular.json`) |
| Upload de avatar some | Disco do Render é efêmero; em produção use storage externo (S3, etc.) |

---

## 7. Segurança (recomendado)

- Troque a senha do admin após o primeiro login
- Defina `APP_SEED_ENABLED=false` depois do seed
- Não commite senhas reais em `application.properties` (use só variáveis no Render)
