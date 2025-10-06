package com.project.demo.logic.entity.producto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto,Long>{
    Page<Producto> getProductoByCategoriaId(Long id, Pageable pageable);
}