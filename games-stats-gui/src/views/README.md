# Views Directory

This directory contains the top-level Vue components that represent the "pages" of your application.

A **View** is typically a component that is directly mapped to a route in the `src/router/index.ts` file. For example, the `/` path might map to `HomeView.vue`, and a future `/dashboard` path would map to `DashboardView.vue`.

Views often compose smaller, reusable components (from the `src/components` directory) to build their final layout and functionality.
