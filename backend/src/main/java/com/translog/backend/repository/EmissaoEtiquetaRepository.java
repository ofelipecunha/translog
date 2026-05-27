package com.translog.backend.repository;

import com.translog.backend.entity.EmissaoEtiqueta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmissaoEtiquetaRepository extends JpaRepository<EmissaoEtiqueta, Integer> {

	List<EmissaoEtiqueta> findByNumeroPedidoIgnoreCaseOrderByDataEmissaoDesc(String numeroPedido);
}
