# AI Agent Backend Development Rules (Node.js + Prisma + MongoDB)

This document establishes the strict coding standards, architectural patterns, and best practices for developing the backend infrastructure.

## 1. General Architecture & Clean Code
* **Layered Architecture:** Enforce strict separation of concerns.
    * **Controllers:** Handle HTTP requests/responses only. No business logic.
    * **Services:** Contain all business logic.
    * **Repositories/DAL:** Handle direct database interactions (via Prisma).
* **SOLID Principles:** adhere strictly to SOLID principles, especially Single Responsibility (SRP) and Dependency Injection (DI) where applicable.
* **DRY (Don't Repeat Yourself):** Abstract repeated logic into utility functions or shared middleware.
* **Type Safety:** If using TypeScript (Recommended), strict mode must be enabled. If using plain JS, use JSDoc for complex function signatures.

## 2. Node.js Best Practices
* **Async/Await:** Use `async/await` for all asynchronous operations. Avoid callback hell or raw `.then()` chains.
* **Environment Variables:** Never hardcode secrets. Use `dotenv` or strict environment variable injection for `DATABASE_URL`, `JWT_SECRET`, etc.
* **Error Handling:**
    * Use a global error handler middleware.
    * Do not `console.error` in production code; use a structured logger (e.g., Winston, Pino).
    * Throw custom error objects (e.g., `AppError` with status codes) rather than generic errors.
* **Validation:** Validate all incoming data (body, params, query) using a library like `Zod` or `Joi` before it reaches the service layer.

## 3. Database & Prisma ORM (MongoDB)
* **Schema Definition:**
    * Use explicit mapping for MongoDB IDs: `@id @map("_id") @db.ObjectId`.
    * Use descriptive Enum names and ensure relations are correctly defined with `@relation`.
* **Performance & Query Optimization (CRITICAL):**
    * **NO N+1 QUERIES:** strictly forbidden. Never execute a database query inside a loop (e.g., `map` or `forEach`).
    * **Solution:** Use Prisma's `include` (for eager loading) or `in` operator (for batch fetching) to retrieve related data in a single query.
    * *Bad Pattern:*
        ```javascript
        // FORBIDDEN
        const users = await prisma.user.findMany();
        for (const user of users) {
           user.posts = await prisma.post.findMany({ where: { userId: user.id } });
        }
        ```
    * *Good Pattern:*
        ```javascript
        // REQUIRED
        const users = await prisma.user.findMany({
            include: { posts: true }
        });
        ```
* **Selective Fetching:** Always use `select` to return only the fields needed by the client. Avoid returning entire huge documents or sensitive fields (like password hashes).
* **Indexing:** Ensure fields used in `where` clauses, sorting, or filtering are indexed in `schema.prisma` using `@@index`.

## 4. Authentication & Security
* **JWT Strategy:**
    * Use `jsonwebtoken` (or a wrapper library).
    * **Token Expiry:** Access tokens must have short expiry (e.g., 15m). Implement Refresh Tokens with longer expiry (e.g., 7d) stored securely in the database.
* **Password Handling:**
    * Never store plain-text passwords.
    * Use `bcrypt` or `argon2` for hashing.
* **Middleware Protection:**
    * All protected routes must pass through an `authenticate` middleware.
    * Attach the decoded user payload to `req.user` (or `context` in GraphQL).

## 5. Formatting & Style
* **Naming Conventions:**
    * Variables/Functions: `camelCase`
    * Files: `kebab-case.js`
    * Classes/Models: `PascalCase`
    * Constants: `UPPER_SNAKE_CASE`
* **Comments:** Comment *why* complex logic exists, not *what* the code is doing.
