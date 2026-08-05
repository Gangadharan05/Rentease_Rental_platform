package com.rentease.backend.repository;

import com.rentease.backend.entity.Product;
import com.rentease.backend.entity.enums.ProductCategory;
import com.rentease.backend.entity.enums.ProductStatus;
import org.springframework.data.jpa.domain.Specification;

/**
 * Mirrors the dynamic `where` object built in the Node backend's
 * productController.getProducts (category / subCategory / search / status).
 */
public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> filter(ProductCategory category, String subCategory,
                                                  String search, ProductStatus status) {
        return (root, query, cb) -> {
            var predicate = cb.conjunction();

            if (status != null) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), status));
            }
            if (category != null) {
                predicate = cb.and(predicate, cb.equal(root.get("category"), category));
            }
            if (subCategory != null && !subCategory.isBlank()) {
                predicate = cb.and(predicate, cb.equal(root.get("subCategory"), subCategory));
            }
            if (search != null && !search.isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }
            return predicate;
        };
    }
}
