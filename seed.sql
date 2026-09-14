SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE reorder_suggestions;
TRUNCATE TABLE batches;
TRUNCATE TABLE products;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Categories
INSERT INTO categories (name, description) VALUES ('Painkillers', 'Analgesics and pain relievers');
INSERT INTO categories (name, description) VALUES ('Antibiotics', 'Bacterial infection treatments');
INSERT INTO categories (name, description) VALUES ('Vitamins', 'Dietary supplements');

-- Insert Suppliers
INSERT INTO suppliers (name, phone, contact_email, address, active) VALUES 
('PharmaCorp Inc.', '123-456-7890', 'john@pharmacorp.com', '123 Health St, NY', true),
('MediSupply LLC', '098-765-4321', 'jane@medisupply.com', '456 Wellness Ave, CA', true);

-- Insert Products
INSERT INTO products (name, sku, description, category_id, unit, cost_price, selling_price, reorder_level, reorder_quantity, active, created_at, updated_at) VALUES 
('Paracetamol 500mg', 'PRC-500', 'Basic painkiller', 1, 'Tablet', 0.10, 0.50, 500, 1000, true, NOW(), NOW()),
('Amoxicillin 250mg', 'AMX-250', 'Antibiotic', 2, 'Capsule', 0.50, 1.50, 200, 500, true, NOW(), NOW()),
('Vitamin C 1000mg', 'VITC-1K', 'Immunity booster', 3, 'Tablet', 0.20, 0.80, 300, 600, true, NOW(), NOW());

-- Insert Batches
-- Batch 1: Good batch of Paracetamol
INSERT INTO batches (batch_number, product_id, supplier_id, manufacturing_date, expiry_date, received_quantity, available_quantity, unit_cost, status, version, created_at) VALUES 
('BATCH-PRC-001', 1, 1, '2023-01-01', DATE_ADD(NOW(), INTERVAL 6 MONTH), 1000, 800, 0.10, 'SAFE', 0, NOW()),

-- Batch 2: Expiring soon batch of Amoxicillin (Expires in 5 days)
('BATCH-AMX-001', 2, 2, '2023-01-01', DATE_ADD(NOW(), INTERVAL 5 DAY), 500, 150, 0.50, 'EXPIRING_WITHIN_7_DAYS', 0, NOW()),

-- Batch 3: Expired batch of Vitamin C (Expired 10 days ago)
('BATCH-VITC-001', 3, 1, '2022-01-01', DATE_SUB(NOW(), INTERVAL 10 DAY), 1000, 200, 0.20, 'EXPIRED', 0, NOW()),

-- Batch 4: Very low stock batch of Paracetamol (Triggering Reorder)
('BATCH-PRC-002', 1, 2, '2023-05-01', DATE_ADD(NOW(), INTERVAL 1 YEAR), 100, 50, 0.12, 'SAFE', 0, NOW());

-- Insert Reorder Suggestions (Since Amoxicillin has 150 total, and reorder level is 200)
INSERT INTO reorder_suggestions (product_id, current_stock, reorder_level, suggested_quantity, status, created_at) VALUES 
(2, 150, 200, 500, 'PENDING', NOW());
