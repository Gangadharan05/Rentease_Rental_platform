package com.rentease.backend.entity;

import com.rentease.backend.entity.enums.ProductCategory;
import com.rentease.backend.entity.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    // bed, sofa, table, fridge, washing_machine, tv, other
    @Column(name = "sub_category", nullable = false)
    private String subCategory;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    @Builder.Default
    private String imageUrl = "https://placehold.co/600x400?text=Product";

    @Column(name = "base_monthly_rent", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseMonthlyRent;

    @Column(name = "security_deposit", nullable = false, precision = 10, scale = 2)
    private BigDecimal securityDeposit;

    // Rental tenures offered for this product, in months e.g. [3, 6, 12]
    @ElementCollection
    @CollectionTable(name = "product_tenure_options", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "months")
    @Builder.Default
    private List<Integer> tenureOptions = new ArrayList<>();

    @Column(name = "total_units", nullable = false)
    @Builder.Default
    private Integer totalUnits = 1;

    @Column(name = "available_units", nullable = false)
    @Builder.Default
    private Integer availableUnits = 1;


    @Column(nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Calculate the effective monthly rent for a given tenure.
     * Longer tenures unlock a discount, rewarding commitment - mirrors
     * the "flexible tenure plans" requirement from the PRD.
     */
    public BigDecimal getMonthlyRentForTenure(int tenureMonths) {
        BigDecimal base = this.baseMonthlyRent;
        BigDecimal discount;
        if (tenureMonths >= 12) {
            discount = new BigDecimal("0.15");
        } else if (tenureMonths >= 6) {
            discount = new BigDecimal("0.08");
        } else if (tenureMonths >= 3) {
            discount = new BigDecimal("0.03");
        } else {
            discount = BigDecimal.ZERO;
        }
        BigDecimal rent = base.subtract(base.multiply(discount));
        return rent.setScale(2, RoundingMode.HALF_UP);
    }
}
