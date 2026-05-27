-- A senha NUNCA fica como texto '123456' na coluna senha_hash.
-- O backend grava e compara um hash BCrypt (string de ~60 caracteres começando com $2a$).

-- Atualize a senha do Felipe para "123456":
UPDATE usuarios
SET senha_hash = '$2a$10$Gg4qjDGz1erR2L1JskbNnuBNGOQrbr7RFkRgbEwEKzXXsp7hKyL.u'
WHERE email = 'fcunha326@gmail.com';

-- Para gerar outro hash, execute no IntelliJ:
-- com.translog.backend.BcryptSenhaUtil (argumento: sua senha)
