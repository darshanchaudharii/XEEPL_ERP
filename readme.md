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

┌─────────────────────────────────────────────────────────────────┐
│ │
│ XEEPL ERP System │
│ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│ React Frontend │
│ (Port 5173) │
│ │
│ - CatalogMaster │
│ - ItemMaster │
│ - MakeQuotation │
│ - UserMaster │
│ - RawMaterialMaster │
│ │
└────────────┬────────────┘
│
│ HTTP/REST
│ JSON/Multipart
│
▼
┌─────────────────────────┐
│ Spring Boot Backend │
│ (Port 8080) │
│ │
│ - REST Controllers │
│ - Business Logic │
│ - File Upload Handler │
│ - PDF Generation │
│ │
└────────────┬────────────┘
│
│ JDBC
│ JPA/Hibernate
│
▼
┌─────────────────────────┐
│ MySQL Database │
│ (Port 3306) │
│ │
│ - users │
│ - items │
│ - raw_materials │
│ - catalogs │
│ - quotations │
│ - quotation_lines │
│ - sections │
│ - contents │
│ │
└─────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ │
│ FILE STORAGE │
│ │
│ uploads/ │
│ ├── catalog-files/ → Downloaded catalog PDFs │
│ ├── user-photos/ → User profile images │
│ └── content-images/ → Content section images │
│ │
└──────────────────────────────────────────────────────────────────┘
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

### File Storage

- **Uploaded files**: Stored in `uploads/catalog-files/` (catalogs), `uploads/user-photos/` (user profile images)
- **Generated PDFs**: Created on-the-fly and streamed to the client (not stored)
- **File download**: Served via `GET /api/catalogs/download/files/{id}`

### Key Interactions

1. **Frontend → Backend**: REST API calls (GET, POST, PUT, DELETE)
2. **Backend → Database**: JPA/Hibernate for CRUD operations
3. **Backend → File System**: Multipart file upload handling and resource streaming
4. **PDF Generation**: Backend generates quotation PDFs dynamically based on DB data

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18.x or higher | Frontend development |
| **Java JDK** | 17 or higher | Backend runtime |
| **Maven** | 3.8+ | Backend build tool |
| **MySQL** | 8.0+ | Database server |
| **Git** | Latest | Version control |

### Ports Used

- **Frontend**: `5173` (Vite dev server)
- **Backend**: `8080` (Spring Boot)
- **MySQL**: `3306` (default)

### Environment Variables

Create the following environment variables or configure them in `application.properties`:


### File Storage

- **Uploaded files**: Stored in `uploads/catalog-files/` (catalogs), `uploads/user-photos/` (user profile images)
- **Generated PDFs**: Created on-the-fly and streamed to the client (not stored)
- **File download**: Served via `GET /api/catalogs/download/files/{id}`

### Key Interactions

1. **Frontend → Backend**: REST API calls (GET, POST, PUT, DELETE)
2. **Backend → Database**: JPA/Hibernate for CRUD operations
3. **Backend → File System**: Multipart file upload handling and resource streaming
4. **PDF Generation**: Backend generates quotation PDFs dynamically based on DB data

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18.x or higher | Frontend development |
| **Java JDK** | 17 or higher | Backend runtime |
| **Maven** | 3.8+ | Backend build tool |
| **MySQL** | 8.0+ | Database server |
| **Git** | Latest | Version control |

### Ports Used

##- **Frontend**: `5173` (Vite dev server)
##- **Backend**: `8080` (Spring Boot)
##- **MySQL**: `3306` (default)

### Environment Variables

## Create the following environment variables or configure them in `application.properties`:

