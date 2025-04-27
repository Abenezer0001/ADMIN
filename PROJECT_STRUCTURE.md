# INSEAT-Admin Frontend Project Structure &amp; Development Guide

This document outlines the structure, technologies, and development process for the INSEAT-Admin frontend application.

## Core Technologies

*   **Framework/Library:** React
*   **Language:** TypeScript
*   **UI Library:** Material UI (MUI)
*   **Routing:** React Router (`react-router-dom`)
*   **HTTP Client:** Axios
*   **State Management:** React Context API (for Auth, Preferences) and Redux/Sagas (intended for complex state like live orders). Note: RBAC context (`RbacContext.tsx`) and Live Order/WebSocket related files (`redux/`, `sagas/`, `services/websocketService.ts`) exist but may not be fully implemented or functional.

## Project Structure (`src/`)

The `src/` directory follows a standard feature-based structure:

1.  **Core Setup (`main.tsx`, `App.tsx`, `index.css`, `App.css`):**
    *   `main.tsx`: Application entry point, renders `App`.
    *   `App.tsx`: Root component, sets up context providers, routing, and renders the main `Layout`.
    *   `index.css`, `App.css`: Global and base application styles.

2.  **Routing (`routes.tsx`):**
    *   Defines all application routes using `react-router-dom`, mapping URL paths to page components. Crucial for adding new sections. Uses lazy loading for components.

3.  **Layout (`components/Layout.tsx`):**
    *   Defines the overall UI structure (sidebar, header, main content area).
    *   Contains the sidebar navigation logic (often driven by a configuration array like `categories`). Updates for new features are made here.

4.  **Components (`components/`):**
    *   **Feature-Specific (e.g., `restaurants/`, `menus/`, `tables/`, `Category/`):** Contain components related to specific data entities.
        *   `...List.tsx`: Displays lists of items (e.g., `RestaurantList.tsx`), often using `common/DataTable.tsx`. Includes view/edit/delete actions.
        *   `...Form.tsx`: Handles *both* creating and editing items (e.g., `AddRestaurant.tsx`, `MenuForm.tsx`). Uses route parameters (`useParams`) to determine mode (add vs. edit). Fetches data in edit mode, calls create/update API on submit.
        *   `...Detail.tsx`: Shows detailed information for a single item (e.g., `RestaurantDetail.tsx`).
    *   **Common (`common/`):** Reusable UI elements (e.g., `DataTable.tsx`, `ProtectedRoute.tsx`, `LogoutButton.tsx`).
    *   **Specialized (`analytics/`, `rbac/`, `settings/`):** Components for specific functional areas.

5.  **Pages (`pages/`):**
    *   Top-level components representing distinct views, directly linked in `routes.tsx` (e.g., `Login.tsx`, `MenuItems/MenuItemDetail.tsx`).

6.  **Services (`services/`):**
    *   Modules encapsulating API calls for specific resources (e.g., `RestaurantService.ts`, `MenuService.ts`).
    *   Use a configured `axios` instance (`utils/axiosConfig.ts`).
    *   Provide methods for CRUD operations (e.g., `getRestaurants`, `createRestaurant`).

7.  **State Management:**
    *   **Context API (`context/`):** For global state (Auth, Preferences, RBAC).
    *   **Redux (`redux/`, `sagas/`):** For more complex state, potentially async operations (WebSockets).

8.  **Hooks (`hooks/`):**
    *   Custom React Hooks for reusable logic (e.g., `usePermission.ts`).

9.  **Types (`types/`):**
    *   TypeScript interfaces and type definitions for data structures.

10. **Utilities (`utils/`):**
    *   Helper functions (API config, formatting, validation).

11. **Styling (`styles/`, `theme/`):**
    *   CSS files and theme configuration.

## Adding a New Feature (Example: "Discounts")

1.  **Backend:** Ensure API endpoints for Discounts exist.
2.  **Service (`services/DiscountService.ts`):** Create a new service file with methods (`getDiscounts`, `createDiscount`, `updateDiscount`, etc.) using `axios`.
3.  **Types (`types/discountTypes.ts` or `types/index.ts`):** Define the `Discount` interface.
4.  **Components (`components/discounts/`):**
    *   `DiscountList.tsx`: Fetch and display discounts using `DiscountService` and `DataTable`. Include action buttons.
    *   `DiscountForm.tsx`: Create a form for discount details. Use `useParams` to check for an ID (edit mode). Fetch data if editing. Call `createDiscount` or `updateDiscount` on submit.
    *   `DiscountDetail.tsx` (Optional): Display read-only details.
5.  **Pages (Optional):** Create a page component if needed (e.g., `pages/DiscountsPage.tsx`).
6.  **Routing (`routes.tsx`):** Add new `<Route>` entries mapping paths like `/discounts`, `/discounts/new`, `/discounts/:id/edit` to the corresponding components, likely wrapped in `<ProtectedRoute>`.
7.  **Navigation (`components/Layout.tsx`):** Modify the sidebar configuration array (e.g., the `categories` array) to add a new menu item linking to `/discounts`.

This structured approach ensures consistency and maintainability as the application grows.

## Current Implementation Status

*   **RBAC (Role-Based Access Control):** While context (`RbacContext.tsx`) and related components/hooks exist, the full functionality might not be implemented or integrated with the backend `auth-service`.
*   **Live Orders / WebSockets:** Redux slices (`orderSlice.ts`), sagas (`orderSagas.ts`, `websocketSagas.ts`), and services (`websocketService.ts`) related to live order updates via WebSockets are present, but the end-to-end functionality is likely incomplete.