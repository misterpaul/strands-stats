# Router Directory

This directory holds the configuration for `vue-router`, the official routing library for Vue.js.

A **router** is essential for a Single-Page Application (SPA). It intercepts browser navigation and dynamically renders different Vue components based on the URL, without requiring a full page reload from the server. This creates a fast and fluid user experience.

## Contents

*   `index.ts`: This is the main configuration file. It creates the router instance and defines an array of `routes`. Each route object maps a URL path (e.g., `/` or `/dashboard`) to a specific "View" component from the `src/views` directory.
