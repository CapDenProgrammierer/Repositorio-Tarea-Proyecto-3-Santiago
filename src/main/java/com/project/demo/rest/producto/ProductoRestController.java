package com.project.demo.rest.producto;

import com.project.demo.logic.entity.categoria.Categoria;
import com.project.demo.logic.entity.categoria.CategoriaRepository;
import com.project.demo.logic.entity.http.GlobalResponseHandler;
import com.project.demo.logic.entity.http.Meta;
import com.project.demo.logic.entity.producto.Producto;
import com.project.demo.logic.entity.producto.ProductoRepository;
import com.project.demo.logic.entity.user.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/productos")
public class ProductoRestController {
    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAll(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size,
        HttpServletRequest request) {

            Pageable pageable = PageRequest.of(page-1, size);
            Page<Producto> productosPage = productoRepository.findAll(pageable);
            Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
            meta.setTotalPages(productosPage.getTotalPages());
            meta.setTotalElements(productosPage.getTotalElements());
            meta.setPageNumber(productosPage.getNumber() + 1);
            meta.setPageSize(productosPage.getSize());

            return new GlobalResponseHandler().handleResponse("Productos retornados successfully",
                    productosPage.getContent(), HttpStatus.OK, meta);
    }

    @GetMapping("/categorias/{categoriaId}/productos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllByCategoria (@PathVariable Long categoriaId,
                                           @RequestParam(defaultValue = "1") int page,
                                           @RequestParam(defaultValue = "10") int size,
                                           HttpServletRequest request) {
        Optional<Categoria> foundCategoria = categoriaRepository.findById(categoriaId);
        if(foundCategoria.isPresent()) {


            Pageable pageable = PageRequest.of(page-1, size);
            Page<Producto> productoPage = productoRepository.getProductoByCategoriaId(categoriaId, pageable);
            Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
            meta.setTotalPages(productoPage.getTotalPages());
            meta.setTotalElements(productoPage.getTotalElements());
            meta.setPageNumber(productoPage.getNumber() + 1);
            meta.setPageSize(productoPage.getSize());


            return new GlobalResponseHandler().handleResponse("Productos retornados",
                    productoPage.getContent(), HttpStatus.OK, meta);
        } else {
            return new GlobalResponseHandler().handleResponse("Categoria con id " + categoriaId + " not found"  ,
                    HttpStatus.NOT_FOUND, request);
        }
    }

    @PostMapping("/categorias/{categoriaId}")
    public ResponseEntity<?> addProductoToCategoria(@PathVariable Long categoriaId, @RequestBody Producto producto, HttpServletRequest request) {
        Optional<Categoria> foundCategoria = categoriaRepository.findById(categoriaId);
        if(foundCategoria.isPresent()) {
            producto.setCategoria(foundCategoria.get());
            Producto savedProducto = productoRepository.save(producto);
            return new GlobalResponseHandler().handleResponse("Producto creado exitosamente",
                    savedProducto, HttpStatus.CREATED, request);
        } else {
            return new GlobalResponseHandler().handleResponse("Categoria con id " + categoriaId + " not found"  ,
                    HttpStatus.NOT_FOUND, request);
        }
    }
    @PatchMapping("/{productoId}")
    public ResponseEntity<?> patchProducto(@PathVariable Long productoId, @RequestBody Producto producto, HttpServletRequest request) {
        Optional<Producto> foundProducto = productoRepository.findById(productoId);
        if(foundProducto.isPresent()) {
            if(producto.getCantidadStock() != null) foundProducto.get().setCantidadStock(producto.getCantidadStock());
            if(producto.getDescripcion() != null) foundProducto.get().setDescripcion(producto.getDescripcion());
            if(producto.getNombre() != null) foundProducto.get().setNombre(producto.getNombre());
            if(producto.getPrecio() != null) foundProducto.get().setPrecio(producto.getPrecio());
            productoRepository.save(foundProducto.get());
            return new GlobalResponseHandler().handleResponse("Producto actualizado exitosamente",
                    foundProducto.get(), HttpStatus.OK, request);
        } else {
            return new GlobalResponseHandler().handleResponse("Producto con id " + productoId + " not found"  ,
                    HttpStatus.NOT_FOUND, request);
        }
    }

    @DeleteMapping("/{productoId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteProducto(@PathVariable Long productoId, HttpServletRequest request) {
        Optional<Producto> foundProducto = productoRepository.findById(productoId);
        if (foundProducto.isPresent()) {
            Optional<Categoria> categoria = categoriaRepository.findById(foundProducto.get().getCategoria().getId());
            categoria.get().getProductos().remove(foundProducto.get());
            productoRepository.deleteById(foundProducto.get().getId());
            return new GlobalResponseHandler().handleResponse(
                    "Producto eliminado exitosamente",
                    foundProducto.get(),
                    HttpStatus.OK,
                    request
            );
        } else {
            return new GlobalResponseHandler().handleResponse(
                    "Producto con id " + productoId + " no encontrado",
                    HttpStatus.NOT_FOUND,
                    request
            );
        }
    }
}
