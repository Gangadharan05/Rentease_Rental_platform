package com.rentease.backend.service;

import com.rentease.backend.dto.request.ProductRequest;
import com.rentease.backend.dto.response.ProductResponse;
import com.rentease.backend.entity.Product;
import com.rentease.backend.entity.enums.ProductCategory;
import com.rentease.backend.entity.enums.ProductStatus;
import com.rentease.backend.exception.ApiException;
import com.rentease.backend.repository.ProductRepository;
import com.rentease.backend.repository.ProductSpecifications;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> getProducts(String category, String subCategory, String search, boolean includeAll) {
        ProductCategory categoryEnum = parseCategory(category);
        ProductStatus statusFilter = includeAll ? null : ProductStatus.ACTIVE;

        return productRepository
                .findAll(ProductSpecifications.filter(categoryEnum, subCategory, search, statusFilter),
                        org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found"));
        return ProductResponse.from(product);
    }

    public ProductResponse createProduct(ProductRequest req) {
        if (isBlank(req.name()) || isBlank(req.category()) || isBlank(req.subCategory())
                || req.baseMonthlyRent() == null || req.securityDeposit() == null) {
            throw ApiException.badRequest("Missing required product fields");
        }

        Integer totalUnits = req.totalUnits() != null ? req.totalUnits() : 1;

        Product product = Product.builder()
                .name(req.name())
                .category(parseCategory(req.category()))
                .subCategory(req.subCategory())
                .description(req.description())
                .imageUrl(req.imageUrl() != null ? req.imageUrl() : "https://placehold.co/600x400?text=Product")
                .baseMonthlyRent(req.baseMonthlyRent())
                .securityDeposit(req.securityDeposit())
                .tenureOptions(req.tenureOptions() != null && !req.tenureOptions().isEmpty()
                        ? req.tenureOptions() : List.of(3, 6, 12))
                .totalUnits(totalUnits)
                .availableUnits(totalUnits)
                .status(ProductStatus.ACTIVE)
                .build();

        return ProductResponse.from(productRepository.save(product));
    }

    public ProductResponse updateProduct(UUID id, ProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found"));

        if (req.name() != null) product.setName(req.name());
        if (req.category() != null) product.setCategory(parseCategory(req.category()));
        if (req.subCategory() != null) product.setSubCategory(req.subCategory());
        if (req.description() != null) product.setDescription(req.description());
        if (req.imageUrl() != null) product.setImageUrl(req.imageUrl());
        if (req.baseMonthlyRent() != null) product.setBaseMonthlyRent(req.baseMonthlyRent());
        if (req.securityDeposit() != null) product.setSecurityDeposit(req.securityDeposit());
        if (req.tenureOptions() != null) product.setTenureOptions(req.tenureOptions());
        if (req.totalUnits() != null) product.setTotalUnits(req.totalUnits());
        if (req.availableUnits() != null) product.setAvailableUnits(req.availableUnits());
        if (req.status() != null) product.setStatus(parseStatus(req.status()));

        return ProductResponse.from(productRepository.save(product));
    }

    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw ApiException.notFound("Product not found");
        }
        productRepository.deleteById(id);
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private ProductCategory parseCategory(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return ProductCategory.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid category: " + raw);
        }
    }

    private ProductStatus parseStatus(String raw) {
        try {
            return ProductStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid status: " + raw);
        }
    }
}
