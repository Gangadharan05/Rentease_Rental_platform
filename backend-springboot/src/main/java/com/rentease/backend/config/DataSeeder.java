package com.rentease.backend.config;

import com.rentease.backend.entity.Product;
import com.rentease.backend.entity.ServiceArea;
import com.rentease.backend.entity.User;
import com.rentease.backend.entity.enums.ProductCategory;
import com.rentease.backend.entity.enums.ProductStatus;
import com.rentease.backend.entity.enums.Role;
import com.rentease.backend.repository.ProductRepository;
import com.rentease.backend.repository.ServiceAreaRepository;
import com.rentease.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, ProductRepository productRepository,
                       ServiceAreaRepository serviceAreaRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.serviceAreaRepository = serviceAreaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedDemoCustomer();
        seedProducts();
        seedServiceAreas();
    }

    private void seedAdmin() {
        String email = "admin@rentease.com";
        if (userRepository.existsByEmail(email)) {
            System.out.println("Admin user already exists, skipping.");
            return;
        }
        User admin = User.builder()
                .name("RentEase Admin")
                .email(email)
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .city("Chennai")
                .build();
        userRepository.save(admin);
        System.out.println("Admin user created -> email: " + email + " / password: Admin@123");
    }

    private void seedDemoCustomer() {
        String email = "customer@rentease.com";
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User customer = User.builder()
                .name("Demo Customer")
                .email(email)
                .password(passwordEncoder.encode("Customer@123"))
                .role(Role.CUSTOMER)
                .city("Chennai")
                .address("12 Anna Salai")
                .build();
        userRepository.save(customer);
        System.out.println("Demo customer created -> email: " + email + " / password: Customer@123");
    }

    private void seedProducts() {
        if (productRepository.count() > 0) {
            System.out.println("Products already exist, skipping product seed.");
            return;
        }

        List<Product> products = List.of(
                Product.builder()
                        .name("Queen Size Wooden Bed")
                        .category(ProductCategory.FURNITURE)
                        .subCategory("bed")
                        .description("Sturdy sheesham wood queen bed with under-storage, perfect for studio and 1BHK apartments.")
                        .imageUrl("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600")
                        .baseMonthlyRent(new BigDecimal("1499"))
                        .securityDeposit(new BigDecimal("3000"))
                        .tenureOptions(List.of(3, 6, 12))
                        .totalUnits(8).availableUnits(8)
                        .status(ProductStatus.ACTIVE)
                        .build(),
                Product.builder()
                        .name("3-Seater Fabric Sofa")
                        .category(ProductCategory.FURNITURE)
                        .subCategory("sofa")
                        .description("Comfortable 3-seater sofa in charcoal grey fabric, ideal for living rooms.")
                        .imageUrl("https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600")
                        .baseMonthlyRent(new BigDecimal("1299"))
                        .securityDeposit(new BigDecimal("2500"))
                        .tenureOptions(List.of(3, 6, 12))
                        .totalUnits(6).availableUnits(6)
                        .status(ProductStatus.ACTIVE)
                        .build(),
                Product.builder()
                        .name("4-Seater Dining Table")
                        .category(ProductCategory.FURNITURE)
                        .subCategory("table")
                        .description("Engineered wood dining table with 4 cushioned chairs.")
                        .imageUrl("https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600")
                        .baseMonthlyRent(new BigDecimal("999"))
                        .securityDeposit(new BigDecimal("2000"))
                        .tenureOptions(List.of(3, 6, 12))
                        .totalUnits(10).availableUnits(10)
                        .status(ProductStatus.ACTIVE)
                        .build(),
                Product.builder()
                        .name("Double Door Refrigerator 265L")
                        .category(ProductCategory.APPLIANCE)
                        .subCategory("fridge")
                        .description("Frost-free double door refrigerator, energy efficient, 265L capacity.")
                        .imageUrl("https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600")
                        .baseMonthlyRent(new BigDecimal("1199"))
                        .securityDeposit(new BigDecimal("4000"))
                        .tenureOptions(List.of(6, 12))
                        .totalUnits(12).availableUnits(12)
                        .status(ProductStatus.ACTIVE)
                        .build(),
                Product.builder()
                        .name("Front Load Washing Machine 6kg")
                        .category(ProductCategory.APPLIANCE)
                        .subCategory("washing_machine")
                        .description("Fully automatic front load washing machine with 6kg capacity, low water usage.")
                        .imageUrl("https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600")
                        .baseMonthlyRent(new BigDecimal("999"))
                        .securityDeposit(new BigDecimal("3500"))
                        .tenureOptions(List.of(6, 12))
                        .totalUnits(10).availableUnits(10)
                        .status(ProductStatus.ACTIVE)
                        .build(),
                Product.builder()
                        .name("43-inch Smart LED TV")
                        .category(ProductCategory.APPLIANCE)
                        .subCategory("tv")
                        .description("Full HD Android smart TV, 43-inch, with built-in streaming apps.")
                        .imageUrl("https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600")
                        .baseMonthlyRent(new BigDecimal("899"))
                        .securityDeposit(new BigDecimal("3000"))
                        .tenureOptions(List.of(3, 6, 12))
                        .totalUnits(15).availableUnits(15)
                        .status(ProductStatus.ACTIVE)
                        .build()
        );

        productRepository.saveAll(products);
        System.out.println("Seeded " + products.size() + " products.");
    }

    private void seedServiceAreas() {
        List<String> cities = List.of("Chennai", "Bengaluru", "Hyderabad", "Coimbatore", "Madurai");
        for (String city : cities) {
            if (!serviceAreaRepository.existsByCity(city)) {
                serviceAreaRepository.save(ServiceArea.builder().city(city).isActive(true).build());
            }
        }
        System.out.println("Seeded service areas: " + String.join(", ", cities));
    }
}
