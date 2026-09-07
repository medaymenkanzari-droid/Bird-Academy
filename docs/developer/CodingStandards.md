# Coding Standards and Best Practices

## 1. Language Rules
- **TypeScript Strict Mode:** All code must run under strict type checks. Explicitly type all parameters.
- **Enums:** Standard `enum` declarations only; do not use `const enum`.
- **Imports:** Named imports are required. All imports must reside at the very top of files.

## 2. React Components
- **Functional Components:** All views should be React functional components with explicit hook dependencies.
- **Hook Safety:** Avoid infinite re-renders. Do not include object references directly inside dependency arrays. Use stable primitive values.
- **CSS Styling:** Use Tailwind CSS exclusively. No inline styles or raw CSS files.
- **Icons:** All icons must be imported from `lucide-react`. Custom SVG elements are forbidden.
