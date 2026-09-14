# FEFO Logic (First-Expiry, First-Out)

## Why FEFO over FIFO?
FIFO (First-In, First-Out) assumes the first item you received is the first one you should sell. In a pharmacy, this is dangerous. A supplier might deliver a batch of medication today that expires in 6 months, and tomorrow deliver a batch that expires in 3 months. If we used FIFO, we would sell the 6-month batch first, letting the 3-month batch expire on the shelf.

FEFO ensures we always issue the product that is closest to its expiration date, regardless of when it arrived in the warehouse.

## How it works programmatically
When a `StockOutRequest` is received for *N* quantity of a Product:

1. **Query:** The `BatchRepository` executes a JPQL query to find all batches for the product where `availableQuantity > 0` AND `expiryDate > today`. 
2. **Sort:** The database sorts the result ascending by `expiryDate`.
3. **Verify:** The system calculates the sum of all available unexpired batches. If it's less than *N*, an `InsufficientStockException` is thrown and the transaction aborts.
4. **Deduct:** A loop iterates over the sorted batches. 
   - If Batch A has 50 units and *N* is 60: Batch A is reduced to 0, a transaction record is created for 50 units, and the loop moves to Batch B looking for the remaining 10.
   - If Batch B has 100 units, it is reduced to 90, a transaction record is created for 10 units, and the loop terminates.
5. **Commit:** The entire operation is wrapped in a Spring `@Transactional` proxy. If any database write fails during the loop, the entire operation is rolled back, preventing partial stock deductions.

## Concurrency Protection
The `Batch` entity uses JPA Optimistic Locking (`@Version`). If two staff members attempt to sell the last 10 units of the same batch simultaneously, the second transaction will fail with an `OptimisticLockException` rather than silently driving the inventory negative.
