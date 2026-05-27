package com.translog.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "emissao_etiqueta_volumes")
@Getter
@Setter
@NoArgsConstructor
public class EmissaoEtiquetaVolume {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_volume")
	private Integer idVolume;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "id_emissao", nullable = false)
	private EmissaoEtiqueta emissao;

	@Column(name = "numero_volume", nullable = false)
	private Integer numeroVolume;

	@Column(name = "codigo_etiqueta", nullable = false, length = 50)
	private String codigoEtiqueta;
}
