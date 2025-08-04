# Code Style and Conventions

## TypeScript
- Strict TypeScript configuration
- Interface definitions for all data structures
- Type safety enforced throughout the codebase

## React/Next.js Conventions
- Functional components with hooks
- Client components marked with 'use client'
- App Router structure (Next.js 14)
- Custom hooks for API calls using TanStack Query

## Naming Conventions
- Components: PascalCase (e.g., `TenantList`, `RoomCard`)
- Files: PascalCase for components, camelCase for utilities
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase

## File Organization
- Components organized by feature (tenants/, rooms/, contracts/)
- Shared UI components in ui/ directory
- Types defined in separate files by domain
- Services for API calls
- Hooks for data fetching and state management

## UI/UX Patterns
- Shadcn/ui components for consistent design
- Card-based layouts for data display
- Dialog modals for forms and details
- Loading states with spinners
- Error handling with user-friendly messages
- Responsive design with Tailwind CSS

## State Management
- Zustand for global state (auth, settings)
- TanStack Query for server state
- Local state with useState for component-specific data