# Stores Directory

This directory contains state management modules using **Pinia**, the official state management library for Vue.js.

A **Pinia store** is a centralized container for data that needs to be shared across multiple components in your application. Instead of passing data up and down the component tree (a process known as "prop drilling"), any component can directly access or modify the state in the store. This is the ideal solution for managing global data like a user's authentication status, profile information, or application-wide settings.

## Contents

*   `auth.ts`: This store is responsible for handling all authentication-related state. It tracks whether a user is currently logged in (`isLoggedIn`) and holds their profile information (`userProfile`) once they authenticate.
