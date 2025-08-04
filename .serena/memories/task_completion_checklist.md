# Task Completion Guidelines

## When a Task is Completed

### 1. Code Quality Checks
- Run `npm run lint` in frontend directory to check for linting errors
- Ensure TypeScript compilation passes without errors
- Verify all imports are correct and unused imports are removed

### 2. Testing
- Test the functionality manually in the browser
- Ensure responsive design works on different screen sizes
- Verify error handling works correctly
- Test edge cases and boundary conditions

### 3. Code Review Checklist
- Components follow established patterns
- Proper error handling is implemented
- Loading states are handled appropriately
- Accessibility considerations are met
- Code is properly typed with TypeScript

### 4. Database Changes
- If database schema changes were made, ensure migrations are created
- Test database operations work correctly
- Verify data integrity is maintained

### 5. Documentation
- Update relevant documentation if needed
- Add comments for complex logic
- Ensure component props are properly typed

### 6. Performance
- Check for unnecessary re-renders
- Optimize API calls and data fetching
- Ensure proper caching with TanStack Query

### 7. Final Verification
- Test the complete user flow
- Verify integration with other components
- Check console for any warnings or errors