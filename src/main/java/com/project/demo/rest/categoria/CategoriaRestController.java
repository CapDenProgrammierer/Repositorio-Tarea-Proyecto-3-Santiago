package com.project.demo.rest.categoria;

import com.project.demo.logic.entity.categoria.Categoria;
import com.project.demo.logic.entity.categoria.CategoriaRepository;
import com.project.demo.logic.entity.http.GlobalResponseHandler;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/categorias")
public class CategoriaRestController {
    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Categoria>> getAllCategorias(HttpServletRequest request) {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createCategoria(@RequestBody Categoria categoria, HttpServletRequest request) {
        Categoria savedGenre = categoriaRepository.save(categoria);
        return new GlobalResponseHandler().handleResponse("Categoria agregada exitosamente",
                savedGenre, HttpStatus.CREATED, request);
    }

    @PutMapping("/{categoriaId}")
    public ResponseEntity<?>updateCategoria(@PathVariable Long categoriaId, @RequestBody Categoria categoria, HttpServletRequest request) {
        Optional<Categoria> optionalCategoria = categoriaRepository.findById(categoriaId);
        if (optionalCategoria.isPresent()) {
            categoria.setId(optionalCategoria.get().getId());
            categoriaRepository.save(categoria);
            return new GlobalResponseHandler().handleResponse("Categoria Actualizada.",
                    categoria, HttpStatus.OK, request);
        } else{
            return new GlobalResponseHandler().handleResponse("Categoria con id " + categoriaId+ " no encontrada",
                    HttpStatus.BAD_REQUEST, request);
        }
    }

    @DeleteMapping("/{categoriaId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteCategoria(@PathVariable Long categoriaId, HttpServletRequest request) {
        Optional<Categoria> foundCategoria = categoriaRepository.findById(categoriaId);
        if (foundCategoria.isPresent()) {
            categoriaRepository.delete(foundCategoria.get());
            return new GlobalResponseHandler().handleResponse(
                    "Categoria eliminada exitosamente",
                    foundCategoria.get(), HttpStatus.OK, request
            );
        } else {
            return new GlobalResponseHandler().handleResponse(
                    "Categoria con id " + categoriaId + " no encontrada",
                    HttpStatus.NOT_FOUND, request
            );
        }
    }
}
