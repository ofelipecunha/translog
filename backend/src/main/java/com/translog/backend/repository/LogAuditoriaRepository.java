package com.translog.backend.repository;

import com.translog.backend.entity.LogAuditoria;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {

	List<LogAuditoria> findTop200ByOrderByCriadoEmDesc();

	@Modifying
	@Query("DELETE FROM LogAuditoria l WHERE l.criadoEm < :limite")
	int deleteByCriadoEmBefore(@Param("limite") LocalDateTime limite);
}
