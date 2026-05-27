package com.translog.backend.repository;

import com.translog.backend.entity.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

	@Query("SELECT u FROM Usuario u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email))")
	Optional<Usuario> findByEmailNormalized(@Param("email") String email);

	@Query("SELECT u FROM Usuario u WHERE LOWER(TRIM(u.login)) = LOWER(TRIM(:login))")
	Optional<Usuario> findByLoginNormalized(@Param("login") String login);

	Optional<Usuario> findByToken(String token);

	@Query(
			"""
			SELECT u FROM Usuario u
			WHERE (:nome IS NULL OR :nome = '' OR LOWER(u.nome) LIKE LOWER(CONCAT('%', :nome, '%')))
			ORDER BY u.nome
			""")
	List<Usuario> listarPorNome(@Param("nome") String nome);

	@Query(
			"SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM Usuario u "
					+ "WHERE LOWER(TRIM(u.login)) = LOWER(TRIM(:login)) AND u.idUsuario <> :id")
	boolean existsLoginForOther(@Param("login") String login, @Param("id") Integer id);

	@Query(
			"SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM Usuario u "
					+ "WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email)) AND u.idUsuario <> :id")
	boolean existsEmailForOther(@Param("email") String email, @Param("id") Integer id);

	@Query(
			"SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM Usuario u "
					+ "WHERE LOWER(TRIM(u.login)) = LOWER(TRIM(:login))")
	boolean existsByLoginNormalized(@Param("login") String login);

	@Query(
			"SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM Usuario u "
					+ "WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email))")
	boolean existsByEmailNormalized(@Param("email") String email);
}
