# Development Workflow và Best Practices

## Development Environment
- **Package Manager**: npm
- **Scripts**:
  - `npm run dev`: Start both frontend và backend concurrently
  - `npm run dev:frontend`: Start only frontend (port 3000)
  - `npm run dev:backend`: Start only backend (port 3001)

## Code Quality Practices

### TypeScript
- Strict TypeScript configuration
- Shared types trong `shared/src/types/`
- Proper interface definitions cho all data models

### Error Handling Patterns
```typescript
// Frontend mutation pattern
const createMutation = useCreateRoom()
try {
  await createMutation.mutateAsync(data)
  toast.success('Success message')
} catch {
  toast.error('Error message')
}
```

### Performance Optimizations
1. **React.memo**: Cho expensive components
2. **useMemo**: Cho computed values và stable objects
3. **TanStack Query caching**: Automatic data caching
4. **Conditional useEffect**: Tránh unnecessary re-renders

## Database Best Practices
- **Prisma migrations**: Version controlled schema changes
- **Proper relations**: Foreign keys và join tables
- **Indexing**: Performance optimization cho queries
- **Data validation**: Both frontend và backend validation

## Common Pitfalls tránh được
1. **Object spread trong useMemo**: Tạo new references → infinite loops
2. **Unconditional setState**: Trong useEffect → infinite re-renders  
3. **Missing dependency arrays**: Trong useEffect và useMemo
4. **Direct state mutation**: Trong Zustand stores

## File Naming Conventions
- **Components**: PascalCase (e.g., `BillList.tsx`)
- **Hooks**: camelCase với `use` prefix (e.g., `useBills.ts`)
- **Types**: PascalCase (e.g., `Bill.ts`)
- **Services**: camelCase với `Service` suffix (e.g., `billService.ts`)

## Git Workflow
- **Branch**: main (development branch)
- **Commits**: Descriptive messages
- **Working directory**: `d:\room-for-rent`