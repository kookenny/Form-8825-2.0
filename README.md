# Form 8825 Prototype

A React TypeScript prototype application for IRS Form 8825 (Rental Real Estate Income and Expenses).

## Getting Started

### Prerequisites

- Node.js (v18 or higher) - Download from [nodejs.org](https://nodejs.org/)
- npm (comes with Node.js)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Project Structure

```
Form 8825/
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md           # This file
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and formatting

## Development

This prototype is designed for IRS Form 8825 (Rental Real Estate Income and Expenses). The application includes:

- Modern React setup with TypeScript
- Vite for fast development and building
- ESLint for code quality
- Hot module replacement for fast development

## Next Steps

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Begin customizing the Form 8825 components
4. Add form validation and data handling
5. Implement responsive design
6. Add backend integration as needed

## Troubleshooting

If you encounter any issues:

1. Ensure Node.js is properly installed: `node --version`
2. Make sure npm is working: `npm --version`
3. Try deleting `node_modules` and running `npm install` again
4. Check that all dependencies are compatible with your Node.js version

## Support

- Node.js: [nodejs.org](https://nodejs.org/)
- React: [reactjs.org](https://reactjs.org/)
- Vite: [vitejs.dev](https://vitejs.dev/)
- TypeScript: [typescriptlang.org](https://www.typescriptlang.org/)
