# Smart Inventory & Expiry Management System

A highly scalable, event-driven, full-stack microservices application designed to solve critical inventory problems in pharmacies, grocery stores, and medical supply chains.

## ?? What This Project Does

This system is built around the **FEFO (First-Expired, First-Out)** principle. Traditional inventory systems just track "how many items" you have. This system tracks *exactly which batches* of those items you have, when they were manufactured, and most importantly, when they expire.

**Key Features:**
1. **Intelligent Stock Deduction:** When a sale occurs via the POS, the system automatically deducts stock from the batch that is closest to its expiration date, drastically reducing product waste.
2. **Real-Time Expiry Alerts:** A background job (Spring Scheduler) runs continuously to scan for batches expiring within 7 days. If found, it publishes an event to an **Apache Kafka** topic, generating live alerts on the dashboard.
3. **Automated Reordering:** The system monitors "Reorder Levels" for all products. If stock drops below a critical threshold, it automatically generates a pending Reorder Suggestion.
4. **Live Analytics & Financial Tracking:** Automatically tracks incoming stock value vs outgoing sales revenue (in ?). Visualized on the Admin Dashboard using Recharts.
5. **Concurrency Safety:** Utilizes JPA Optimistic Locking (`@Version`) to ensure that if two cashiers try to sell the exact same bottle of medicine at the exact same millisecond, the database prevents negative stock or race conditions.
6. **High Performance:** Uses **Redis** caching to instantly serve product catalog data without querying the MySQL database, ensuring the UI remains lightning fast.

## ?? Roles & Access Control

The system implements strict Role-Based Access Control (RBAC) via Spring Security JWTs to separate administrative oversight from daily operations:

*   **ADMIN**: Has full access to the system. Can view financial analytics, manage the product catalog, add new batches, configure settings, and monitor live expiration alerts.
*   **USER (Cashier)**: Restricted access. Upon logging in, cashiers are immediately routed to the **Point of Sale (POS)** module. They can process transactions and deduct stock, but cannot view overall business financial metrics or modify the product catalog.

## ?? Technical Stack

*   **Frontend:** React, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router (SPA)
*   **Backend:** Java, Spring Boot 3, Spring Data JPA, Spring Security (JWT)
*   **Databases:** MySQL 8.0 (Primary DB), Redis (Caching)
*   **Message Broker:** Apache Kafka & Zookeeper (Event Streaming)
*   **Web Server:** Nginx (SPA reverse proxy)
*   **Deployment:** Fully containerized with Docker & Docker Compose

## ??? How to Run Locally

1.  Ensure **Docker Desktop** is installed and running on your machine.
2.  Open a terminal in the root directory of this project.
3.  Run the following command to build and start all microservices:
    ```bash
    docker compose up --build -d
    ```
4.  Wait a few seconds for the backend to initialize the database schema and seed the default data.
5.  Access the web application at: **http://localhost:3000**

### Default Login Credentials

The system automatically seeds two default accounts for testing on first boot:

**Admin Account** (Full Access & Analytics Dashboard)
*   **Username:** `admin`
*   **Password:** `admin123`

**Cashier Account** (Restricted to Point of Sale)
*   **Username:** `cashier`
*   **Password:** `admin123`

## ?? What Features Can Be Further Added?

If you want to expand this project further, here are the best features to build next:

1.  **Barcode / QR Code Scanner Integration:**
    Add a feature to the React app that accesses the device camera to scan a product's barcode (SKU). This would instantly pull up the product details and deduct stock without manual typing.
2.  **Automated Supplier Emailing:**
    When a Reorder Suggestion is generated, write a Spring Boot Email Service that automatically drafts and sends a purchase order PDF to the Supplier's email address.
3.  **Predictive Analytics (AI):**
    Feed the `InventoryTransactions` table into a machine learning model to predict *when* a product will run out of stock based on seasonal sales trends.
4.  **Multi-Warehouse Support:**
    Expand the database schema to track which specific warehouse or store branch holds which batches, allowing stock transfers between locations.

