---
trigger: always_on
---

# React Development Rules

## 1. Rules of Hooks (MANDATORY)

**Instruction:** You must follow the [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) without exception.

- **Only Call Hooks at the Top Level:**
  - Don’t call Hooks inside loops, conditions, or nested functions.
  - Always use Hooks at the top level of your React function, before any early returns.
  - **Bad:**
    ```tsx
    if (!data) return null;
    const value = useMemo(() => ..., [data]); // ❌ Violation
    ```
  - **Good:**
    ```tsx
    const value = useMemo(() => ..., [data]);
    if (!data) return null;
    ```
- **Only Call Hooks from React Functions:**
  - Call Hooks from React function components.
  - Call Hooks from custom Hooks.

## 2. Dependency Arrays

- **Exhaustive Dependencies:** Always include all variables used inside the hook in the dependency array.
  - Use `es-lint-plugin-react-hooks` guidance.
- **Stable References:** Be careful with object/function dependencies. Use `useMemo` or `useCallback` to stabilize them if they cause unnecessary re-renders.

## 3. Component Structure

- **Presentational vs. Container:** Keep business logic/state in hooks or parent components; keep UI components pure and focused on rendering props.
- **Props Interface:** Define explicit interfaces for component props.

## 4. Performance

- **Memoization:** Use `useMemo` for expensive calculations and `useCallback` to prevent function recreation on every render, especially when passing functions to child components.
- **Key Prop:** Always use a unique and stable `key` when rendering lists. Avoid using array index if the list can change.

## 5. Custom Hooks

- **Naming:** Start with `use` (e.g., `useDepartmentData`).
- **Encapsulation:** Encapsulate complex logic or side effects in custom hooks to keep components clean.
