# `frontend`

This file is for frontend coding guidelines

## folder structure

```
├── src
│   ├── assets
│   │   ├── img
│   │   ├── svg
│   │   └── css
│   ├── constants
│   ├── features
│   │   ├── featureA
│   │   ├── featureB
│   │   └──  ...
│   ├── routes
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── router.tsx
│   │   └──  ...
│   ├── types
│   ├── utils
│   ├── App.tsx
│   ├── index.tsx
│   ├── react-app-env.d.ts
│   └── setupTests.ts
├── .dockerignore
├── .eslintrc.json
├── .gitignore
├── .prettierrc.json
├── craco.config.ts
├── Dockerfile
├── package.json
├── README.md
├── tailwind.config.js
└──  tsconfig.json
```

### assets

Static assets such as images, icons, css used across the application.

img: Image files. Example: logo.png
svg: SVG icon files. Example: add-icon.svg
css: CSS files and other stylesheets used globally. Example: main.css

### constants

Constants are fixed values defined in a centralized location, used throughout the application for consistency and maintainability.

Example: config.ts might contain values like API endpoints or reusable static information.

### features

Features are the specific functionality under the application.

Each feature folder should follow the rule below:

-   Must take a explicit and clear folder name.
-   Must contain one `index.ts` which exports all functionalities sush as components, hooks, stores and so on.
-   Could contain components, hooks, stores folders.

### routes

Contains all routes across the application, folder structure should mirror routes configuration.

`routers.tsx`: This is only one file that should be put in the root of routes folder, containing all routes configuration.
`layout.tsx`: This is a layout route for the url path. It must contain `<Outlet />` component.
`page.tsx` This is a page route for thr url path.

Route is defined on [this](https://reactrouter.com/en/main/route/route)

### types

TypeScript type definitions and interfaces.

Example: userTypes.ts defining the types related to user data.

-> TODO: Exact some global types here

### utils

Utility functions that can be used across the application.

Example: formatDate.ts which would contain a function to format dates consistently across the app.

## tests

Test file has a suffix of .test or .spec and are placed in the nearest file.
