package com.translog.backend.repository;

import com.translog.backend.entity.Empresa;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Integer> {

	@Query(
			"""
			SELECT e FROM Empresa e
			WHERE (:nome IS NULL OR :nome = '' OR LOWER(e.razaoSocial) LIKE LOWER(CONCAT('%', :nome, '%'))
				OR LOWER(e.nomeFantasia) LIKE LOWER(CONCAT('%', :nome, '%')))
			ORDER BY e.razaoSocial
			""")
	List<Empresa> listarPorNome(@Param("nome") String nome);

	@Query(
			"""
			SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Empresa e
			WHERE REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '/', ''), '-', '') = :cnpjDigitos
			""")
	boolean existsByCnpjDigitos(@Param("cnpjDigitos") String cnpjDigitos);

	@Query(
			"""
			SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Empresa e
			WHERE REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '/', ''), '-', '') = :cnpjDigitos
				AND e.codEmpresa <> :id
			""")
	boolean existsByCnpjDigitosForOther(@Param("cnpjDigitos") String cnpjDigitos, @Param("id") Integer id);
}
