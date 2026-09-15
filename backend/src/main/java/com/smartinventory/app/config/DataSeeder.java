package com.smartinventory.app.config;

import com.smartinventory.app.entity.Role;
import com.smartinventory.app.entity.User;
import com.smartinventory.app.repository.UserRepository;
import com.smartinventory.app.entity.Category;
import com.smartinventory.app.entity.Product;
import com.smartinventory.app.repository.CategoryRepository;
import com.smartinventory.app.repository.ProductRepository;
import com.smartinventory.app.repository.BatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final BatchRepository batchRepository;

    @Override
    public void run(String... args) throws Exception {
        
        // Force update existing users or create if missing
        userRepository.findByUsername("admin").ifPresent(u -> {
            u.setUsername("Administrator");
            u.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(u);
        });
        userRepository.findByUsername("cashier").ifPresent(u -> {
            u.setUsername("Sales Associate");
            u.setPassword(passwordEncoder.encode("associate1"));
            userRepository.save(u);
        });
        
        if (userRepository.count() == 0) {
            User admin = User.builder().username("Administrator").password(passwordEncoder.encode("admin123")).role(Role.ADMIN).active(true).build();
            User user = User.builder().username("Sales Associate").password(passwordEncoder.encode("associate1")).role(Role.USER).active(true).build();

            userRepository.save(admin);
            userRepository.save(user);
        } else {
            userRepository.findAll().forEach(u -> {
                u.setActive(true);
                userRepository.save(u);
            });
        }
        
        // Seed a default category if missing so products can be saved
        if (categoryRepository.count() == 0) {
            Category cat = new Category();
            cat.setName("General");
            cat.setDescription("General Items");
            categoryRepository.save(cat);
        }

        // Seed default products
        if (productRepository.count() == 0) {
            Category cat = categoryRepository.findAll().get(0);
            Product p1 = Product.builder().name("Paracetamol 500mg").sku("PRC-500").category(cat).costPrice(java.math.BigDecimal.valueOf(1.50)).sellingPrice(java.math.BigDecimal.valueOf(3.00)).reorderLevel(100).reorderQuantity(500).unit("Box").build();
            Product p2 = Product.builder().name("Vitamin C 1000mg").sku("VTC-1000").category(cat).costPrice(java.math.BigDecimal.valueOf(4.00)).sellingPrice(java.math.BigDecimal.valueOf(8.50)).reorderLevel(50).reorderQuantity(200).unit("Bottle").build();
            Product p3 = Product.builder().name("Amoxicillin 250mg").sku("AMX-250").category(cat).costPrice(java.math.BigDecimal.valueOf(5.00)).sellingPrice(java.math.BigDecimal.valueOf(12.00)).reorderLevel(30).reorderQuantity(150).unit("Pack").build();
            
            productRepository.save(p1);
            productRepository.save(p2);
            productRepository.save(p3);
        }

        // Seed a batch if none exist so the FEFO engine isn't empty!
        if (batchRepository.count() == 0 && productRepository.count() > 0) {
            Product p1 = productRepository.findAll().get(0);
            
            com.smartinventory.app.entity.Batch b1 = com.smartinventory.app.entity.Batch.builder()
                    .product(p1)
                    .batchNumber("B-PRC-001")
                    .manufacturingDate(java.time.LocalDate.now().minusMonths(2))
                    .expiryDate(java.time.LocalDate.now().plusMonths(10))
                    .receivedQuantity(200)
                    .availableQuantity(200)
                    .unitCost(p1.getCostPrice())
                    .status("SAFE")
                    .build();
            batchRepository.save(b1);
        }
    }
}
