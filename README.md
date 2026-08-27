# React Redux Base

A clean, scalable **React + TypeScript + Redux** starter project that gives you a reusable foundation for building modern web applications.

## 🚀 Features

* ⚛️ React
* 🔷 TypeScript
* 🧩 Redux Toolkit
* 🔄 Redux state management
* 🌐 API integration
* 📝 Form handling
* 🛡️ Reusable components
* 📱 Responsive UI
* 🔐 Authentication-ready structure
* 📁 Scalable project architecture
* 🔧 Environment variable support
* 📦 Easy to extend with new modules

## 🛠️ Tech Stack

| Technology    | Purpose                    |
| ------------- | -------------------------- |
| React         | Frontend UI                |
| TypeScript    | Type safety                |
| Redux Toolkit | Global state management    |
| React Router  | Application routing        |
| Axios         | API communication          |
| Vite          | Development and build tool |
| ESLint        | Code quality               |
| Git           | Version control            |

## 📂 Project Structure

```text
react-redux-base/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── routes/
│   ├── services/
│   ├── store/
│   │   ├── slices/
│   │   ├── actions/
│   │   └── index.ts
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 📋 Prerequisites

Make sure these are installed before you start:

* Node.js
* npm
* Git

Check the installed versions:

```bash
node -v
npm -v
git --version
```

## ⚙️ Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Move into the project:

```bash
cd react-redux-base
```

Install dependencies:

```bash
npm install
```

## ▶️ Run the Project

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

## 🏗️ Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🔐 Environment Variables

Create a `.env` file in the project root.

Example:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Never commit sensitive credentials, API keys, passwords, or tokens to Git.

Use `.env.example` as a template:

```env
VITE_API_BASE_URL=
```

## 🔄 Redux Structure

Redux is organized into separate slices so the application remains easy to maintain as it grows.

Example:

```text
store/
├── index.ts
└── slices/
    ├── authSlice.ts
    ├── userSlice.ts
    └── commonSlice.ts
```

Example usage:

```ts
import { useDispatch, useSelector } from "react-redux";
```

Keep business logic inside the appropriate slices/services instead of putting everything inside React components.

## 🌐 API Integration

Keep API-related functionality inside the `services` directory.

Example:

```text
services/
├── api.ts
├── authService.ts
└── userService.ts
```

Example API configuration:

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
```

## 🧭 Routing

Keep application routes separate from page components.

Example:

```text
routes/
├── AppRoutes.tsx
├── PrivateRoutes.tsx
└── PublicRoutes.tsx
```

This makes public and authenticated routes easier to manage.

## 🧩 Reusable Components

Place common UI components inside:

```text
src/components/
```

Examples:

```text
components/
├── Button/
├── Input/
├── Modal/
├── Table/
├── Loader/
└── Header/
```

Where possible, design components to accept props instead of duplicating UI logic.

## 🧹 Code Quality

Run ESLint:

```bash
npm run lint
```

Before creating a pull request, check that:

* The project builds successfully.
* ESLint has no unresolved errors.
* Unused imports are removed.
* Environment secrets aren't committed.
* Redux logic is properly separated.
* Components are reusable where appropriate.

## 🌿 Git Workflow

Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

Example:

```bash
git checkout -b feature/redux-changes
```

Commit your changes:

```bash
git add .
git commit -m "feat: update redux state management"
```

Push the branch:

```bash
git push origin feature/redux-changes
```

## 📝 Commit Convention

Recommended commit prefixes:

```text
feat:     New feature
fix:      Bug fix
refactor: Code refactoring
docs:     Documentation changes
style:    Styling changes
test:     Test changes
chore:    Configuration or maintenance
```

Examples:

```text
feat: add authentication flow
fix: resolve login API error
refactor: improve redux structure
docs: update README
style: update dashboard layout
```

## 🔒 Security

Don't commit sensitive information such as:

```text
.env
API keys
Passwords
JWT secrets
Database credentials
SMTP passwords
Private tokens
```

Make sure sensitive files are included in `.gitignore`.

## 📦 Useful Commands

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm install`     | Install dependencies     |
| `npm run dev`     | Start development server |
| `npm run build`   | Create production build  |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## 🤝 Contributing

1. Create a feature branch.
2. Make your changes.
3. Test the application.
4. Run linting and the production build.
5. Commit using the recommended convention.
6. Push your branch.
7. Create a Pull Request.

## 📄 License

This project is intended as a reusable React + Redux base for application development.

Add your preferred license here if this repository will be distributed publicly.

---

## 👨‍💻 Developer

**Nandha Kumar**

React • TypeScript • Redux • Node.js • PHP

---

⭐ If this base project is useful, consider giving the repository a star.
