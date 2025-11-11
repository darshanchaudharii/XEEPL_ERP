# XEEPL ERP Backend

Spring Boot backend that powers the XEEPL ERP. Exposes REST endpoints for Users, Sections, Contents, Items, Raw Materials, Catalogs, and Quotations. Uses Spring Data JPA and MySQL.

## 🔧 Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8+

## ⚙️ Configuration (`src/main/resources/application.properties`)
```
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/xeepl_erp?useSSL=false&serverTimezone=UTC
spring.datasource.username=xe_user
spring.datasource.password=xe_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.leak-detection-threshold=60000
app.file.upload-dir=D:/XEEPL ERP/XEEPL ERP Backend/uploads/catalog-files
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=20MB
```

## 🚀 Run
```bash
./mvnw clean package
./mvnw spring-boot:run
# OR
java -jar target/xeepl-erp-backend-0.0.1-SNAPSHOT.jar
```

## 🌐 Key Endpoints (base: `/api`)
- Users: `/users`
- Items: `/items`
- Raw Materials: `/raw-materials`
- Catalogs:
  - GET `/catalogs`
  - POST `/catalogs` (multipart)
  - GET `/catalogs/download/files/{id}`
- Quotations:
  - GET `/quotations` – list
  - GET `/quotations/{id}` – fetch (use `?includeRemoved=true` to include removed raws)
  - POST `/quotations` – create
  - PUT `/quotations/{id}` – update/finalize
  - DELETE `/quotations/{id}` – delete
  - PATCH `/quotations/lines/{lineId}` – edit a line
  - PATCH `/quotations/lines/{lineId}/remove` – soft delete a line
  - PATCH `/quotations/lines/{lineId}/undo` – restore a removed line
  - POST/PUT `/quotations/{id}/link-catalogs` – link catalogs
  - GET `/quotations/{id}/catalogs-zip` – download catalogs as ZIP
  - GET `/quotations/{id}/export-pdf` – PDF export stub (client handles download now)

## 🧠 Quotation Snapshot
When a quotation is finalized, a JSON snapshot of lines is stored into `quotation_snapshots` for audit and reproducible output later. See `QuotationService.finalizeQuotation`.

## 📦 Tech
- Spring Boot, Spring Web, Spring Data JPA
- MySQL driver, HikariCP

## 🔍 Tips
- Enable SQL logs in development:
```
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

## 📄 License
MIT (see project root). © 2025 XEEPL ERP.


