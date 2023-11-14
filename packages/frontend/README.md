# `frontend`

This file is for frontend coding guidelines

## folder structure

```
├── src
|   ├── __tests__
│   ├── assets
│   │   ├── images
│   │   └── icons
│   ├── components
│   │   ├── common
│   │   ├── layout
│   │   ├── ...
│   ├── contexts
│   ├── hooks
│   ├── layouts
│   ├── pages
│   ├── services
│   ├── styles
│   ├── types
│   ├── utils
│   ├── index.tsx
│   ├── react-app-env.d.ts
│   ├── socket.ts
|   └── config.ts
├── .gitignore
├── package.json
└── ...
```

### **tests**

Contains all the test files for the project, mirroring the structure of the src/ directory.

components: Unit tests for individual components. Example: Button.test.tsx
contexts: Tests for context providers and consumers. Example: AuthContext.test.tsx
layouts: Tests for layout components. Example: MainLayout.test.tsx
pages: Tests for page components. Example: HomePage.test.tsx

-> TODO: Now we have two tests folder on in the root and one in src. We have to modify it.

### assets

Static assets such as images and icons used across the application.

images: Image files. Example: logo.png
icons: SVG icon files. Example: add-icon.svg

### components

React components that are reused in multiple places. If the component has specific usage in certain feature and won't be reused in multiple places. It should be in the feature folder

```
├── components
│   │   ├── common
│   │   ├── layout
│   │   ├── comments
|   |   |    ├── CommentForm.tsx
```

common: Generic components like Button.tsx, Input.tsx.
layout: Components that make up the layout of the application, such as Header.tsx, Footer.tsx.

The layout subfolder inside components is usually meant for smaller layout helpers or components that manage the layout of content within a page, rather than the overall page structure. These might be used to handle the layout of specific content sections within a page or to abstract common layout patterns.

-> TODO: Change modals naming and move it into common folder

### contexts

React Context API files for global state management.

### hooks

Custom React hooks for sharing logic between components.

-> TODO: Exact each files like components folder. For example, useSignupWithServer should be in child folder login.

### layouts

Components that define various page layouts.

Example: MainLayout.tsx which could include the Header and Footer components.

### pages

Components that represent entire pages.

Example: HomePage.tsx which would be rendered at the application's root path.

### styles

CSS files and other stylesheets.

-> TODO: move signupLoadingModal.css into styles folder

### types

TypeScript type definitions and interfaces.

Example: userTypes.ts defining the types related to user data.

-> TODO: Exact some global types here

### utils

Utility functions that can be used across the application.

Example: formatDate.ts which would contain a function to format dates consistently across the app.

### services

Services for handling external operations such as API calls.

Example: apiService.ts which abstracts the fetch calls to the API.

-> TODO: Modify api service in for example User.tsx into units and put it in the folder

### constants

Constants are fixed values defined in a centralized location, used throughout the application for consistency and maintainability.

Example: constants.ts might contain values like API endpoints, error messages, or reusable static information.
