# Khuddam — Admin Panel

A React + Vite admin dashboard for Khuddam. Provides student management, automated attendance and messaging, Zoom integration, reports, and administrative tools.

## Key Features
- Automated attendance
- Automated WhatsApp messaging
- Automatic Zoom class creation and scheduling
- Student records and scores
- Attendance reports and export (xlsx)
- Email/communications templates

## Quickstart
Prerequisites: Node 16+ and npm (or yarn).

1. Install dependencies

```bash
npm install
```

2. Create environment file

Copy `.env` or create one with at least:

```env
VITE_BASEURL=https://api.example.com
```

3. Run in development

```bash
npm run dev
```

4. Build for production

```bash
npm run build
npm run preview
```

## Available NPM scripts
- `dev`: Starts Vite dev server
- `build`: Builds the production bundle with Vite
- `preview`: Serve the built production bundle locally
- `lint`: Run ESLint

## Important files
- `src/App.jsx` — Routes and app bootstrapping
- `src/utils/api.js` — Axios instance using `VITE_BASEURL`
- `src/utils/axiosInterceptor.js` — Handles 403 responses and redirects to login
- `src/Pages/` — Top-level page modules used in the dashboard
- `src/components/` — Reusable UI components and layout (Sidebar, Dashboard, Toasts)

## Project structure (top-level)

- `src/`
	- `App.jsx`, `main.jsx`
	- `components/` (common UI + dashboard)
	- `Pages/` (dashboard pages grouped by feature)
	- `routes/` (AuthRoute)
	- `utils/` (api and interceptors)

## Environment
This project uses `import.meta.env.VITE_BASEURL` (see `src/utils/api.js`) for the API base URL. Add any other VITE_ prefixed variables as needed.

## Dependencies
Major dependencies include React, React Router, Axios, Vite, FontAwesome, and xlsx for exports. See `package.json` for full list.

## Notes
- The axios interceptor clears `localStorage` and redirects to `/` on HTTP 403 responses (logout behavior).
- ESLint is included; run `npm run lint` to check code style.

## Contributing
Open an issue or submit a PR. Follow existing code style and run linters before committing.

## License
No license specified.

---
Generated README for this workspace.