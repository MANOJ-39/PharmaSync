# Deployment & Setup Guide

## Prerequisites
- Docker & Docker Compose
- Java 21 (For local non-Docker development)
- Maven (For local non-Docker development)
- Node.js 20+ (For local non-Docker frontend development)

## 1. Quick Start (Full Stack via Docker)

This is the easiest way to launch the entire stack (MySQL, Redis, Zookeeper, Kafka, Spring Boot Backend, React Frontend).

```bash
# Clone the repository
git clone <repo-url>
cd smart-inventory-expiry-management

# Start the infrastructure and applications
docker-compose up --build -d
```

Once the containers are healthy:
- **Frontend Dashboard:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080/api`
- **Swagger Documentation:** `http://localhost:8080/swagger-ui.html`

## 2. Local Development Setup (Without Dockerizing the Apps)

If you want to run the backend and frontend locally for development/debugging, but keep the databases in Docker:

### Step 2.1: Start Infrastructure
```bash
# Start only the databases and message broker
docker-compose up -d mysql redis zookeeper kafka
```

### Step 2.2: Start Backend
```bash
cd backend
# Build and run tests
mvn clean install
# Start Spring Boot
mvn spring-boot:run
```

### Step 2.3: Start Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.
