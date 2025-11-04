# XEEPL ERP Frontend

Enterprise Resource Planning System Frontend built with React and Vite.

## Features

- **User Management**: Create, update, and manage users with roles and permissions
- **Section Master**: Manage different sections of content
- **Content Master**: Handle dynamic content with categories and subcategories
- **Item Master**: Inventory management for items
- **Raw Materials**: Track and manage raw materials
- **Catalog Management**: Digital catalog management with file uploads
- **Quotations**: Create, manage, and finalize quotations
- **Make Quotation**: Interactive quotation creation interface

## Tech Stack

- **React 19**: Latest React with hooks
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **FontAwesome**: Icon library
- **CSS3**: Modern styling with flexbox and grid

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:8080`

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5174`

### API Configuration

The frontend is configured to proxy API requests to the backend during development. The proxy is configured in `vite.config.js`:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

This solves CORS issues during development by routing all `/api/*` requests through the Vite dev server to the backend.

## Project Structure

```
src/
├── components/         # React components
│   ├── common/        # Shared components (Navbar, Footer, etc.)
│   ├── users/         # User management
│   ├── sections/      # Section management
│   ├── contents/      # Content management
│   ├── items/         # Item management
│   ├── rawmaterials/  # Raw material management
│   ├── catalogs/      # Catalog management
│   ├── quotations/    # Quotation management
│   └── home/          # Home page
├── services/          # API service layer
├── styles/            # CSS files
├── utils/             # Utility functions and constants
├── App.jsx            # Main application component
└── main.jsx           # Application entry point
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Environment Setup

Make sure your backend API is running on `http://localhost:8080` before starting the frontend.

## Contributing

1. Follow the existing code structure
2. Use functional components with hooks
3. Maintain consistent styling
4. Write clean, readable code

## License

© 2025 XEEPL ERP. All rights reserved.
