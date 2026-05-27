-- Ajusta tabela empresas criada manualmente ou por versão antiga da migração.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'empresas' AND column_name = 'id_empresa'
    ) THEN
        ALTER TABLE empresas RENAME COLUMN id_empresa TO cod_empresa;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'empresas' AND column_name = 'endereco'
    ) THEN
        ALTER TABLE empresas ADD COLUMN endereco VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'empresas' AND column_name = 'numero'
    ) THEN
        ALTER TABLE empresas ADD COLUMN numero VARCHAR(20);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'empresas' AND column_name = 'bairro'
    ) THEN
        ALTER TABLE empresas ADD COLUMN bairro VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'empresas' AND column_name = 'cidade'
    ) THEN
        ALTER TABLE empresas ADD COLUMN cidade VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'empresas' AND column_name = 'estado'
    ) THEN
        ALTER TABLE empresas ADD COLUMN estado CHAR(2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'empresas' AND column_name = 'cep'
    ) THEN
        ALTER TABLE empresas ADD COLUMN cep VARCHAR(10);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'empresas' AND column_name = 'cnpj'
            AND character_maximum_length < 18
    ) THEN
        ALTER TABLE empresas ALTER COLUMN cnpj TYPE VARCHAR(18);
    END IF;

    UPDATE empresas SET nome_fantasia = razao_social
    WHERE nome_fantasia IS NULL OR TRIM(nome_fantasia) = '';

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'empresas' AND column_name = 'nome_fantasia'
            AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE empresas ALTER COLUMN nome_fantasia SET NOT NULL;
    END IF;
END $$;
