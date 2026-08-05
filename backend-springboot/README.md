# RentEase — Spring Boot Backend

A full-featured REST API built with **Spring Boot 3.3 + PostgreSQL**, providing
exact feature parity with the Node.js backend — same endpoints, same business
logic, same JWT-based auth, same transactional checkout with pessimistic locking.

---

## 🛠 Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Java (JDK) | 17 or 21 | https://adoptium.net |
| Apache Maven | 3.8+ | https://maven.apache.org/download.cgi |
| PostgreSQL | 14+ | https://www.postgresql.org/download |

> **Windows tip:** After installing Maven, add its `bin` folder to your system PATH so
> `mvn` works in PowerShell. The same applies to the JDK `bin` folder for `java`/`javac`.

---

## 🚀 Quick Start

### 1. Create the database (same one the Node backend uses)

```sql
-- In psql or pgAdmin:
CREATE DATABASE rentease;
```

### 2. Configure the application

Edit `src/main/resources/application.properties` (or set environment variables):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/rentease
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD

jwt.secret=change_this_to_a_long_random_secret_key
client.url=http://localhost:5173
```

### 3. Build and run

```powershell
cd backend-springboot

# Download dependencies and build
mvn clean package -DskipTests

# Run the application (seeds demo data automatically on first start)
mvn spring-boot:run
```

Or run the built JAR directly:
```powershell
java -jar target/rentease-backend-1.0.0.jar
```

The API starts on **http://localhost:5000**

---

## 🔑 Demo Credentials (seeded automatically)

| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| Admin    | admin@rentease.com       | Admin@123     |
| Customer | customer@rentease.com    | Customer@123  |

---

## 🗂 Project Structure

```
backend-springboot/
├── pom.xml                          ← Maven dependencies
└── src/main/
    ├── resources/
    │   └── application.properties   ← DB, JWT, CORS config
    └── java/com/rentease/backend/
        ├── RenteaseBackendApplication.java   ← Entry point
        ├── config/
        │   ├── SecurityConfig.java           ← Spring Security + CORS
        │   └── DataSeeder.java               ← Auto-seeds demo data
        ├── security/
        │   ├── JwtUtil.java                  ← Token generation + validation
        │   └── JwtAuthFilter.java            ← Request auth filter
        ├── entity/
        │   ├── User.java
        │   ├── Product.java                  ← Includes tenure pricing logic
        │   ├── Rental.java
        │   ├── MaintenanceRequest.java
        │   ├── ServiceArea.java
        │   └── enums/                        ← Role, RentalStatus, etc.
        ├── repository/
        │   ├── UserRepository.java
        │   ├── ProductRepository.java        ← Pessimistic lock for checkout
        │   ├── ProductSpecifications.java    ← Dynamic catalog filtering
        │   ├── RentalRepository.java
        │   ├── MaintenanceRequestRepository.java
        │   └── ServiceAreaRepository.java
        ├── dto/
        │   ├── request/                      ← RegisterRequest, CheckoutRequest…
        │   └── response/                     ← AuthResponse, RentalResponse…
        ├── service/
        │   ├── AuthService.java
        │   ├── ProductService.java
        │   ├── RentalService.java            ← @Transactional checkout
        │   ├── MaintenanceService.java
        │   ├── ServiceAreaService.java
        │   └── AdminService.java             ← KPI calculations
        ├── controller/
        │   ├── HealthController.java
        │   ├── AuthController.java
        │   ├── ProductController.java
        │   ├── RentalController.java
        │   ├── MaintenanceController.java
        │   ├── ServiceAreaController.java
        │   └── AdminController.java
        └── exception/
            ├── ApiException.java             ← Runtime exception with HTTP status
            └── GlobalExceptionHandler.java   ← Converts exceptions → JSON errors
```

---

## 🌐 API Endpoints

All endpoints are identical to the Node.js backend — the React frontend works
with this backend without any changes.

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register new customer |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |

### Products
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | — | Browse catalog (`?category=furniture&subCategory=bed&search=wood&_all=true`) |
| GET | `/api/products/:id` | — | Product detail with tenure pricing |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Rentals
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/rentals` | Customer | Checkout — creates rental orders |
| GET | `/api/rentals/my` | Customer | My rentals |
| GET | `/api/rentals` | Admin | All rentals (`?status=pending`) |
| PUT | `/api/rentals/:id/status` | Admin | Update rental status |
| POST | `/api/rentals/:id/return` | Customer | Request return/pickup |
| POST | `/api/rentals/:id/extend` | Customer | Extend tenure |

### Maintenance
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/maintenance` | Customer | Raise maintenance request |
| GET | `/api/maintenance/my` | Customer | My requests |
| GET | `/api/maintenance` | Admin | All requests (`?status=open`) |
| PUT | `/api/maintenance/:id` | Admin | Resolve / update |

### Service Areas
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/service-areas` | — | Active delivery cities |
| GET | `/api/service-areas/all` | Admin | All cities incl. paused |
| POST | `/api/service-areas` | Admin | Add city |
| PUT | `/api/service-areas/:id` | Admin | Activate / pause city |
| DELETE | `/api/service-areas/:id` | Admin | Remove city |

### Admin
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/admin/reports` | Admin | KPI dashboard data |
| GET | `/api/admin/users` | Admin | All customers |

---

## 📦 Maven Dependencies

| Dependency | Purpose |
|-----------|---------|
| `spring-boot-starter-web` | HTTP server, REST controllers |
| `spring-boot-starter-data-jpa` | JPA / Hibernate ORM |
| `spring-boot-starter-security` | Authentication & authorization |
| `spring-boot-starter-validation` | Bean validation (`@Valid`, `@NotBlank`) |
| `postgresql` | PostgreSQL JDBC driver |
| `jjwt-api/impl/jackson` | JWT token generation & validation |
| `lombok` | Reduces boilerplate (`@Getter`, `@Builder`, etc.) |
| `spring-boot-devtools` | Auto-restart on file changes during dev |

---

## 🔄 Switching from Node to Spring Boot backend

1. Stop the Node backend (`Ctrl+C` in its terminal)
2. Start this Spring Boot backend (`mvn spring-boot:run`)
3. Both use the **same PostgreSQL `rentease` database** — the Spring Boot backend
   will auto-update the schema on first start via `ddl-auto=update`
4. The React frontend needs **no changes** — all API routes are identical

---

## 🚢 Production Notes

- Change `spring.jpa.hibernate.ddl-auto` from `update` to `validate` and use
  **Flyway** or **Liquibase** for proper schema migrations
- Set a strong `jwt.secret` (at least 32 random characters)
- Set `client.url` to your deployed frontend URL for CORS
- Build a production JAR: `mvn clean package -DskipTests`
- Run: `java -jar target/rentease-backend-1.0.0.jar`
