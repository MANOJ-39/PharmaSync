package com.smartinventory.app.service;

import com.smartinventory.app.dto.InventoryTransactionDTO;
import com.smartinventory.app.dto.StockOutRequest;
import com.smartinventory.app.entity.Batch;
import com.smartinventory.app.entity.InventoryTransaction;
import com.smartinventory.app.entity.Product;
import com.smartinventory.app.entity.Role;
import com.smartinventory.app.entity.User;
import com.smartinventory.app.repository.BatchRepository;
import com.smartinventory.app.repository.InventoryTransactionRepository;
import com.smartinventory.app.repository.ProductRepository;
import com.smartinventory.app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private BatchRepository batchRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private InventoryTransactionRepository transactionRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private Product product;
    private User user;

    @BeforeEach
    void setUp() {
        product = Product.builder().id(1L).name("Paracetamol").build();
        user = User.builder().id(1L).username("admin").role(Role.ADMIN).build();

        // Mock Security Context
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", "password")
        );
        lenient().when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        lenient().when(productRepository.findById(1L)).thenReturn(Optional.of(product));
    }

    @Test
    void testStockOutFefo_SuccessfulDeductionAcrossMultipleBatches() {
        // Arrange
        Batch batch1 = Batch.builder().id(1L).batchNumber("B1").availableQuantity(50).expiryDate(LocalDate.now().plusDays(10)).product(product).build();
        Batch batch2 = Batch.builder().id(2L).batchNumber("B2").availableQuantity(100).expiryDate(LocalDate.now().plusDays(20)).product(product).build();
        
        when(batchRepository.findAvailableBatchesForProductOrderByExpiryAsc(eq(1L), any(LocalDate.class)))
                .thenReturn(Arrays.asList(batch1, batch2));

        when(transactionRepository.save(any(InventoryTransaction.class))).thenAnswer(i -> {
            InventoryTransaction tx = i.getArgument(0);
            tx.setId(System.currentTimeMillis());
            return tx;
        });

        StockOutRequest request = new StockOutRequest();
        request.setProductId(1L);
        request.setQuantity(80);

        // Act
        List<InventoryTransactionDTO> result = inventoryService.stockOutFefo(request);

        // Assert
        assertEquals(2, result.size());
        assertEquals(50, result.get(0).getQuantity()); // 50 from batch 1
        assertEquals("B1", result.get(0).getBatchNumber());
        assertEquals(0, batch1.getAvailableQuantity()); // batch 1 empty

        assertEquals(30, result.get(1).getQuantity()); // 30 from batch 2
        assertEquals("B2", result.get(1).getBatchNumber());
        assertEquals(70, batch2.getAvailableQuantity()); // batch 2 has 70 left

        verify(batchRepository, times(2)).save(any(Batch.class));
    }

    @Test
    void testStockOutFefo_ThrowsExceptionWhenInsufficientStock() {
        // Arrange
        Batch batch1 = Batch.builder().id(1L).batchNumber("B1").availableQuantity(20).expiryDate(LocalDate.now().plusDays(10)).product(product).build();
        
        when(batchRepository.findAvailableBatchesForProductOrderByExpiryAsc(eq(1L), any(LocalDate.class)))
                .thenReturn(Arrays.asList(batch1));

        StockOutRequest request = new StockOutRequest();
        request.setProductId(1L);
        request.setQuantity(50); // Asking for 50, only 20 available

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            inventoryService.stockOutFefo(request);
        });
        
        assertTrue(exception.getMessage().contains("INSUFFICIENT_STOCK"));
        verify(batchRepository, never()).save(any(Batch.class));
    }
}
