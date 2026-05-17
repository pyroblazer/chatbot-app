# Software Development Best Practices

## Clean Code Principles

### Naming
- Use descriptive names: `getUserById` not `getU` or `fetch`
- Boolean variables: `isLoading`, `hasError`, `canSubmit`
- Functions should do ONE thing and be named as verbs: `calculateTotal`, `sendEmail`
- Constants in UPPER_SNAKE_CASE: `MAX_RETRY_COUNT`

### Functions
- Keep functions short (ideally under 20 lines)
- Single Responsibility Principle: one function, one job
- Avoid side effects where possible (pure functions)
- Maximum 3-4 parameters; use an options object for more

### Error Handling
- Never swallow errors silently (`catch (e) {}` is almost always wrong)
- Fail fast and loud in development
- Return typed errors instead of throwing when possible (Result pattern)
- Always handle the unhappy path before the happy path

## TypeScript Best Practices

### Types
```typescript
// Prefer interfaces for objects, types for unions/intersections
interface User { id: string; name: string; email: string }
type Status = 'active' | 'inactive' | 'pending'

// Use generics for reusable utilities
function first<T>(arr: T[]): T | undefined { return arr[0] }

// Avoid `any` - use `unknown` and narrow it
function parse(data: unknown): User {
  if (typeof data !== 'object' || data === null) throw new Error('Invalid')
  return data as User
}
```

### Utility Types
- `Partial<T>`: all fields optional
- `Required<T>`: all fields required
- `Pick<T, K>`: select specific fields
- `Omit<T, K>`: exclude specific fields
- `Record<K, V>`: typed dictionary

## React Best Practices

### Hooks
```typescript
// Custom hooks encapsulate logic
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}
```

### Performance
- `useMemo` for expensive calculations
- `useCallback` for functions passed as props to memoized children
- `React.memo` for pure components that re-render too often
- Code split with `dynamic()` or `React.lazy()` for large components
- Avoid creating new objects/arrays in JSX (moves reference equality)

### State Management
- Local state first (useState)
- Lift state only when needed
- Context for low-frequency global state (theme, user)
- Zustand/Redux for high-frequency or complex state

## Common Algorithms

### Big O Cheat Sheet
- Array lookup by index: O(1)
- Array search: O(n)
- Binary search (sorted array): O(log n)
- Hash map get/set: O(1) average
- Sorting: O(n log n) for comparison sorts

### Useful Patterns
```typescript
// Debounce
const debounce = <T extends unknown[]>(fn: (...args: T) => void, ms: number) => {
  let timer: ReturnType<typeof setTimeout>
  return (...args: T) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms) }
}

// Deep clone (simple)
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

// Group array by key
const groupBy = <T>(arr: T[], key: keyof T) =>
  arr.reduce((acc, item) => {
    const k = String(item[key])
    return { ...acc, [k]: [...(acc[k] ?? []), item] }
  }, {} as Record<string, T[]>)
```

## Git Workflow
- Commit messages: `type(scope): description` (e.g., `feat(auth): add JWT refresh`)
- Types: feat, fix, chore, docs, refactor, test, style
- Branch naming: `feature/`, `fix/`, `chore/`
- Small, atomic commits - one logical change per commit
- Never commit secrets or API keys

## API Design
- REST: nouns for resources (`/users`, `/orders`), verbs via HTTP method
- Always version your API (`/api/v1/`)
- Return consistent error shapes: `{ error: string, code: string }`
- Use pagination for list endpoints
- Validate and sanitize all input at the boundary

## Security Checklist
- [ ] Never trust client input - validate server-side
- [ ] Parameterized queries to prevent SQL injection
- [ ] Escape output to prevent XSS
- [ ] Use HTTPS everywhere
- [ ] Store passwords with bcrypt (cost factor ≥ 12)
- [ ] Rate limit authentication endpoints
- [ ] Set security headers (CSP, HSTS, X-Frame-Options)
- [ ] Keep dependencies updated (audit regularly)
