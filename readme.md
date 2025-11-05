# XEEPL_ERP

> Full-stack ERP for managing Items, Raw Materials, Catalogs and Quotations — React frontend + Spring Boot backend with PDF export for quotations.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](#license)

---

## 📘 Table of Contents

- [Overview](#overview)  
- [Tech Stack](#tech-stack)  
- [Architecture](#architecture)  
- [Prerequisites](#prerequisites)  
- [Quick Start (5 minutes)](#quick-start-5-minutes)  
- [Backend Setup](#backend-setup)  
  - [Configuration (`application.properties`)](#configuration-applicationproperties)  
  - [Run Backend](#run-backend)  
  - [Hikari / DB Tips](#hikari--db-tips)  
- [Frontend Setup](#frontend-setup)  
  - [Environment](#environment)  
  - [Dev Proxy (vite)](#dev-proxy-vite)  
- [Database Schema & Sample SQL](#database-schema--sample-sql)  
- [API Reference (key endpoints)](#api-reference-key-endpoints)  
- [Make Quotation — behavior & rules](#make-quotation---behavior--rules)  
- [PDF Generation](#pdf-generation)  
- [Screenshots](#screenshots)  
- [Troubleshooting & FAQ](#troubleshooting--faq)  
- [Testing & QA](#testing--qa)  
- [Contributing](#contributing)  
- [License & Contact](#license--contact)  
- [Appendix: docs/SETUP-QUICK.md](#appendix-docssetup-quickmd)

---

## 🧾 Overview

**XEEPL_ERP** is a compact ERP web application that helps manage catalogs, items, raw materials and create quotations with hierarchical line items (ITEMs and RAW materials). Quotations can be displayed on-screen and exported to a printable PDF that matches the UI layout.

---

## 🧩 Tech Stack

- **Frontend**: React (Vite), CSS  
- **Backend**: Java 17+, Spring Boot, HikariCP, Spring Data JPA  
- **Database**: MySQL 8.x  
- **PDF**: Server-side (Puppeteer / wkhtmltopdf) or client-side (html2canvas / jsPDF)  
- **Build Tools**: Maven, npm  

---

## 🏗️ Architecture



[Browser (React @5173)] <---HTTP/REST---> [Spring Boot API @8080] <---JDBC---> [MySQL]
|
+-- File system (uploads/catalog-files/)
+-- PDF generation (on-demand)


---

## ⚙️ Prerequisites

- Node.js 18+  
- Java JDK 17+  
- Maven 3.8+  
- MySQL 8+  
- Git  

**Ports**  
- Frontend → 5173  
- Backend → 8080  
- Database → 3306  

---

## 🚀 Quick Start (5 minutes)

```bash
# Clone repository
git clone https://github.com/youruser/XEEPL_ERP.git
cd XEEPL_ERP

# Start backend
cd "XEEPL ERP Backend"
./mvnw spring-boot:run

# Start frontend
cd ../xeepl-erp-frontend
npm install
npm run dev


➡️ Open: http://localhost:5173

🔧 Backend Setup
Configuration (src/main/resources/application.properties)
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/xeepl_erp?useSSL=false&serverTimezone=UTC
spring.datasource.username=xe_user
spring.datasource.password=xe_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

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

Run Backend
cd "XEEPL ERP Backend"
./mvnw clean package
./mvnw spring-boot:run
# OR
java -jar target/xeepl-erp-backend-0.0.1-SNAPSHOT.jar

Hikari / DB Tips

Adjust pool size for your environment.

Use leak-detection-threshold in development.

Debug with:

logging.level.com.zaxxer.hikari=DEBUG
logging.level.org.hibernate.SQL=DEBUG

💻 Frontend Setup
Environment

.env.local

VITE_API_BASE=http://localhost:8080

Install & Run
cd xeepl-erp-frontend
npm install
npm run dev

Dev Proxy (vite)
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
});


Main components

CatalogMaster.jsx

ItemMaster.jsx

MakeQuotation.jsx

🗄️ Database Schema & Sample SQL
CREATE DATABASE xeepl_erp;
USE xeepl_erp;

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50),
  password_hash VARCHAR(255)
);

CREATE TABLE items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(255),
  item_code VARCHAR(100),
  item_category_id INT,
  supplier_id INT,
  item_qty DECIMAL(12,3),
  item_price DECIMAL(12,2),
  description TEXT
);

CREATE TABLE catalogs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  file_name VARCHAR(500),
  file_path VARCHAR(1000),
  file_type VARCHAR(100),
  file_size BIGINT,
  description TEXT,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255),
  show_raw_prices BOOLEAN DEFAULT TRUE,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotation_lines (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  quotation_id BIGINT NOT NULL,
  line_type ENUM('ITEM','RAW'),
  parent_item_id BIGINT NULL,
  title VARCHAR(255),
  description TEXT,
  qty DECIMAL(12,3),
  rate DECIMAL(12,2),
  total DECIMAL(14,2),
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
);


Example insert:

INSERT INTO catalogs (title, file_name, file_path, file_type, description)
VALUES ('Sample Catalog', 'sample.pdf', 'catalog-files/sample.pdf', 'application/pdf', 'Test catalog');

🌐 API Reference (key endpoints)

Base URL: http://localhost:8080/api

Catalogs
Method	Endpoint	Description
GET	/api/catalogs	Fetch all catalogs
POST	/api/catalogs	Upload new catalog (multipart)
GET	/api/catalogs/download/files/{id}	Download catalog file
PUT	/api/catalogs/{id}	Update catalog
DELETE	/api/catalogs/{id}	Delete catalog
Items
Method	Endpoint
GET	/api/items
POST	/api/items
PUT	/api/items/{id}
DELETE	/api/items/{id}
Quotations
Method	Endpoint	Description
GET	/api/quotations/{id}	Fetch a quotation with items/raws
POST	/api/quotations	Create quotation
GET	/api/quotations/{id}/download	Download quotation PDF
🧾 Make Quotation — Behavior & Rules

Parent ITEM rows have bold title (16–18px) and description below.

RAW material rows appear under each parent item, labeled a), b), c)....

Raw rows show name, description, qty, rate, and total.

Toggles:

Show raw prices → hide/show rate and total for raw rows only.

Show removed rows → toggle visibility of deleted items.

PDF output matches exactly what’s displayed.

🧠 PDF Generation
Option 1 – Server-side (recommended)

Endpoint: /api/quotations/{id}/download

Uses Puppeteer or wkhtmltopdf for perfect fidelity.

Returns application/pdf.

Option 2 – Client-side

Uses html2canvas/jsPDF from frontend.

Easier to integrate but lower fidelity.

For repeated headers on multi-page PDFs:
Add thead { display: table-header-group; }

🖼️ Screenshots

(Store under docs/images/)

Make Quotation (UI)

Quotation PDF

Quotation Table

Catalog Master

Item Master

Raw Material Master

User Master

Quotation List

Show Removed Raw Rows

⚠️ Troubleshooting & FAQ

Download 404 / 500?
→ Ensure file exists in upload folder.
→ Confirm controller mapping /download/files/{id}.

CORS errors?
Enable CORS:

registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:5173")
        .allowedMethods("*");


Hikari warnings?
Ignore initial “driver unknown” — it resolves after first DB query.

File permissions?
Ensure backend upload directory has read/write permissions.

✅ Testing & QA
Manual

Upload a catalog

Create a quotation

Toggle “Show raw prices”

Download PDF

Verify matching layout

Automated
# Backend
mvn test

# Frontend
npm run test

🤝 Contributing

Fork the repo

Create feature branch git checkout -b feat/feature-name

Commit and push

Open a Pull Request

📄 License & Contact

License: MIT
Contact: support@xeepl.com

📘 Appendix: docs/SETUP-QUICK.md
# XEEPL_ERP — Quick Setup

1. Clone repo  
   ```bash
   git clone https://github.com/youruser/XEEPL_ERP.git
   cd XEEPL_ERP


Create database

CREATE DATABASE xeepl_erp;


Run backend

cd "XEEPL ERP Backend"
./mvnw spring-boot:run


Run frontend

cd ../xeepl-erp-frontend
npm install
npm run dev


Visit http://localhost:5173