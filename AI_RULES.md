# AI Rules for ArenaOne Application

This document outlines the core technologies used in the ArenaOne application and provides clear guidelines on which libraries to use for specific functionalities. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of our chosen tech stack.

## Tech Stack Overview

The ArenaOne application is built using a modern and robust set of technologies:

*   **React 18**: The primary JavaScript library for building dynamic and interactive user interfaces.
*   **TypeScript**: A superset of JavaScript that adds static type definitions, enhancing code quality and developer experience.
*   **Tailwind CSS**: A utility-first CSS framework used for rapid and consistent styling, ensuring responsive designs across all devices.
*   **Vite**: A fast and efficient build tool that provides a quick development server and optimized production builds.
*   **shadcn/ui**: A collection of beautifully designed and accessible UI components, built on Radix UI primitives and styled with Tailwind CSS.
*   **Lucide React**: A comprehensive icon library providing a wide range of customizable SVG icons.
*   **React Router**: The standard library for client-side routing, managing navigation within the single-page application.
*   **Supabase**: Our chosen Backend-as-a-Service (BaaS) for authentication, real-time database, and storage.
*   **@tanstack/react-query**: A powerful library for managing server state, including data fetching, caching, synchronization, and updates.
*   **react-hook-form** with **Zod**: Used together for efficient form management, validation, and schema definition.
*   **sonner** and **@radix-ui/react-toast**: Libraries for displaying elegant and informative toast notifications to users.
*   **date-fns**: A modern JavaScript date utility library for parsing, validating, manipulating, and formatting dates.
*   **recharts**: A composable charting library built with React and D3, used for data visualization.

## Library Usage Rules

To maintain a consistent and efficient codebase, please follow these guidelines when implementing features:

*   **UI Components**:
    *   **Always** prioritize `shadcn/ui` components for all standard UI elements (e.g., `Button`, `Card`, `Input`, `Select`, `Dialog`, `Tabs`, `Avatar`, `Badge`).
    *   If a specific `shadcn/ui` component is not available or requires significant deviation from its intended design, create a new component in `src/components/` that either wraps existing `shadcn/ui` primitives or is built from scratch using Tailwind CSS.
    *   **Do NOT** modify files within `src/components/ui/` directly. These are considered base components.

*   **Styling**:
    *   **Exclusively** use **Tailwind CSS** utility classes for all component styling.
    *   Ensure all designs are **responsive** and adapt well to different screen sizes (mobile-first approach).
    *   Avoid inline styles or separate `.css` files for individual components. Global styles and Tailwind configurations are managed in `src/index.css` and `tailwind.config.ts`.
    *   Use `clsx` and `tailwind-merge` via the `cn` utility function (`src/lib/utils.ts`) for conditionally applying and merging Tailwind classes.

*   **Icons**:
    *   Use icons from the `lucide-react` library.

*   **Routing**:
    *   All client-side navigation and routing should be handled using `react-router-dom`.
    *   Define the main application routes within `src/App.tsx`.

*   **State Management (Server State)**:
    *   For fetching, caching, synchronizing, and updating server data, use `@tanstack/react-query`. This includes data from Supabase.

*   **State Management (Client State)**:
    *   For local component state, use React's built-in `useState` and `useReducer` hooks.
    *   For global client-side state that is not server-related, use `React Context` if the complexity is low. Avoid over-engineering with complex state management libraries unless explicitly necessary for large-scale global state.

*   **Forms**:
    *   Implement all forms using `react-hook-form` for efficient state management, validation, and submission.
    *   For schema-based form validation, integrate `Zod` with `react-hook-form` using `@hookform/resolvers`.

*   **Backend & Authentication**:
    *   All interactions with the backend (database queries, authentication, storage) must be done using the `supabase` client (`@supabase/supabase-js`) as configured in `src/integrations/supabase/client.ts`.

*   **Notifications**:
    *   Use `sonner` for displaying simple, non-blocking toast notifications.
    *   For more complex or interactive toast notifications, leverage the `@radix-ui/react-toast` components via the `useToast` hook.

*   **Date Manipulation**:
    *   Any operations involving dates (formatting, calculations, parsing) should use `date-fns`.

*   **Charting**:
    *   If data visualization through charts is required, use `recharts`.

*   **Code Structure**:
    *   New components should be created in `src/components/`.
    *   New pages should be created in `src/pages/`.
    *   Utility functions should reside in `src/lib/` or a more specific `src/utils/` if applicable.
    *   Custom React hooks should be placed in `src/hooks/`.
    *   Keep files small and focused on a single responsibility.

*   **Error Handling**:
    *   Do not wrap API calls or asynchronous operations in `try/catch` blocks unless specific local error handling (e.g., displaying a toast) is required. Allow errors to propagate for centralized handling and debugging.

*   **Simplicity**:
    *   Always aim for the simplest and most elegant solution. Avoid over-engineering. Implement only what is requested and necessary.