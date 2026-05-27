package com.translog.backend.repository;

import com.translog.backend.entity.EmissaoEtiquetaVolume;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmissaoEtiquetaVolumeRepository extends JpaRepository<EmissaoEtiquetaVolume, Integer> {

	List<EmissaoEtiquetaVolume> findByEmissaoIdEmissaoOrderByNumeroVolumeAsc(Integer idEmissao);
}
