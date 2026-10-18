# Project Specification

## Purpose

This project is a starter e-commerce API built with Hono, TypeScript, PostgreSQL, Prisma ORM 8, and Prisma Composer. It currently provides basic user management and category and product read endpoints. The data contract includes additional commerce entities for carts, orders, payments, and reviews, but HTTP workflows for those entities are not implemented yet.

## Runtime and deployment

- The HTTP application is defined in `src/index.ts` and serves through `@hono/node-server`.
- The configured port is the valid integer `PORT` value from 0 through 65535; if it is missing or invalid, the app uses port 3000.
- `/` returns `{ "message": "E-Commerce API is running" }`.
- Composer wires the app to a provisioned PostgreSQL database. The direct development server uses `DATABASE_URL` when set.
- Local Composer development: `bun run dev:composer`.
- Direct development server: `bun run dev` (requires `DATABASE_URL`).
- Deployment: `bun run deploy` builds the app and invokes Composer deployment.
- `bun run seed` runs an idempotent seed script for three sample users, categories, and products. The current HTTP route path does not invoke this script automatically. Seeded products refer to category IDs `1`, `2`, and `3`.

## API conventions

- API routes are mounted under `/users`, `/categories`, and `/products`.
- Successful collection responses use `{ "data": [...] }`; successful single-resource responses use `{ "data": {...} }`, with some write operations also returning a `message`.
- List endpoints currently return at most 10 records and do not expose pagination or sorting parameters.
- Route parameter IDs must be positive integers. Invalid parameters or request bodies are rejected by Zod validation.
- No authentication, authorization, API versioning, or shared error envelope is implemented.

## HTTP endpoints

### Users

| Method and path | Behavior | Responses |
|---|---|---|
| `GET /users` | Return up to 10 users with `id`, `email`, `name`, `createdAt`, and `updatedAt`. | `200 { data }` |
| `GET /users/:id` | Return one user by numeric ID. | `200 { data }`; `404 { error: "User not found" }` |
| `POST /users` | Create a user. `email` is required, trimmed, and limited to 255 characters; `name` is optional, trimmed, non-empty when supplied, and limited to 100 characters. | `201 { message, data }`; `400` validation error; `409` duplicate email; `500` unexpected failure |
| `PATCH /users/:id` | Update email and/or name. At least one field is required and fields follow the create constraints. | `200 { message, data }`; `400` validation error; `404` user not found; `409` duplicate email; `500` unexpected failure |
| `DELETE /users/:id` | Delete a user by numeric ID. | `200 { message, data }`; `404` user not found; `500` unexpected failure |

### Categories

| Method and path | Behavior | Responses |
|---|---|---|
| `GET /categories` | Return up to 10 categories with `id`, `name`, `slug`, `createdAt`, and `updatedAt`. | `200 { data }` |
| `GET /categories/:id` | Return one category by numeric ID. | `200 { data }`; `404 { error: "Category not found" }` |
| `POST /categories` | Create a category. `name` and `slug` are required and limited to 100 characters. Slugs are lowercase alphanumeric words separated by single hyphens. | `201 { data }`; `400` validation error |
| `PATCH /categories/:id` | Update `name` and/or `slug`; both are optional and use the create constraints. The current schema also accepts an empty object. | `200 { data }`; `400` validation error; `404 { error: "CATEGORY_NOT_FOUND" }` |

Category uniqueness is enforced by the database contract for both name and slug. The service pre-checks duplicate slugs on update, but not duplicate names; create and update routes do not map database uniqueness failures to a conflict response. The user service also pre-checks email duplicates, but concurrent writes can still reach the database constraint and become an unexpected error.

### Products

| Method and path | Behavior | Responses |
|---|---|---|
| `GET /products` | Return up to 10 products with scalar product fields, including price, stock, active status, and timestamps. | `200 { data }` |
| `GET /products/:id` | Return one product by numeric ID. | `200 { data }`; `404` when no product exists (currently the error text is `"Category not found"`) |

Product write routes, filters, category expansion, and pagination are not implemented.
The product list currently includes inactive products. A missing product currently returns the error text `"Category not found"`.

## Data model

The source of truth is `src/prisma/contract.prisma`. Generated contract artifacts are committed alongside it.

- **User** has a unique email, optional name, timestamps, addresses, an optional cart, orders, and reviews.
- **Address** belongs to a user and stores contact and postal address details, with an `isDefault` flag.
- **Category** has a unique name and slug and can contain products.
- **Product** belongs to a category and stores name, unique slug and SKU, optional description and image URL, decimal price, stock, active status, and timestamps.
- **Cart** belongs one-to-one to a user and contains cart items.
- **CartItem** joins a cart and product, with a default quantity of one and one row per cart/product pair.
- **Order** belongs to a user and contains a unique order number, status, total, timestamps, a shipping-address snapshot, items, and an optional payment.
- **OrderItem** belongs to an order and product and snapshots product name, SKU, purchase price, and quantity. A product may appear once per order.
- **Payment** belongs one-to-one to an order and stores amount, status, payment method, and an optional unique transaction ID.
- **Review** belongs to a user and product, stores an integer rating and optional comment, and allows one review per user/product pair.
- Order statuses are `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, and `CANCELLED`.
- Payment statuses are `PENDING`, `COMPLETED`, `FAILED`, and `REFUNDED`.

The contract defines relation deletion behavior and indexes. It does not currently enforce a single default address per user, rating bounds, nonnegative stock or quantities, or currency and precision semantics for decimal monetary values. Deleting a user is restricted when that user has orders, while related addresses, carts, and reviews cascade on deletion.

## Out of scope for the current implementation

The following are represented in the database model or typical commerce workflows but do not yet have API or service behavior in this project:

- Cart creation and item management.
- Checkout, order creation, order lookup, status transitions, and cancellations.
- Payment processing, refunds, and payment-provider integration.
- Address management and shipping workflows.
- Product and category create/update/delete APIs, product search, and inventory adjustment.
- Review submission and moderation.
- JWT-based authentication and authorization, customer ownership checks, and administrative roles. JWT is the intended authentication approach; it is not implemented yet.
- Pagination, filtering, sorting, API documentation, and automated tests.

## Project constraints and conventions

- Use the Prisma 8 data contract at `src/prisma/contract.prisma`; after changing it, regenerate artifacts with `bun run contract:emit` and manage database changes through the Prisma migration workflow.
- Request validation uses Zod schemas colocated with each module.
- Route handlers are grouped by resource under `src/modules/<resource>/` and call service functions for database operations.
- Database access is provided by `src/prisma/db.ts`, preferring the Composer-bound database client and falling back to a PostgreSQL client configured from `DATABASE_URL`.
- Keep generated contract artifacts and migration refs aligned with the current data contract; do not treat the migration directory as proof that the current contract has been applied.

## Tech Stack

- Runtime: Bun
- Language: TypeScript
- Framework: Hono.js
- Validation: Zod
- Database: PostgreSQL
- ORM: Prisma 8 with Prisma Composer

For the current Composer deployment, `tsdown` builds the server bundle for Node.js 22.18; Bun is used for local development and project scripts.

## Development Principles

- Use TypeScript strict mode. (`strict` is enabled in `tsconfig.json`.)
- Validate incoming requests with Zod.
- Keep route handlers and business logic separate: routes in `src/modules/<resource>/*.routes.ts` should delegate database and business operations to the corresponding service module.
- Follow the existing project architecture: group code by resource, keep request schemas alongside their resource, and centralize database access through `src/prisma/db.ts`.
- Avoid unnecessary dependencies.
- Do not upgrade or replace existing dependencies without approval.

## Audit Findings and Priorities

The following notes describe confirmed current-state gaps and risks identified by static inspection. They are not implemented features or completed fixes.

1. **Reconcile migration history before deployment.** The only committed migration, `migrations/app/20261010T0810_init/`, targets snapshot `797cfed44e9c40efbc00a689b87c92c44cd4b60e1ae3d6ffbc0304d8f348aaf5`, whose models are `Post` and `User`. The current contract and `migrations/app/refs/db.json` point to snapshot `3a3d3c36282a72b19844fc19e45eff262d3b2011ffed242e60b59c159c642f46`, which contains the ecommerce models. There is no committed migration connecting those snapshots. Review the intended baseline and migration graph before relying on deploy or migration commands to create/update a database.
2. **Implement JWT authentication and enforce access policy.** JWT is the intended authentication approach. User routes currently expose email addresses and allow create, update, and delete operations without authentication or authorization. Add JWT verification and appropriate ownership/role checks before exposing these routes to untrusted clients.
3. **Make seed data deterministic and document its lifecycle.** Seeding is manual in the current route architecture, despite the README's first-query claim. Resolve category IDs by stable keys rather than fixed numeric IDs, and keep sample records out of shared or production databases unless explicitly intended.
4. **Add database and request-level invariants.** Decide policies for default addresses, ratings, stock, quantities, and monetary values; enforce them consistently in the contract and API validation.
5. **Standardize validation and database error responses.** Handle category name/slug conflicts, user email race conflicts, and validation errors consistently. Reject empty category patches and return `"Product not found"` for missing products.
6. **Decide product visibility and add tests.** Specify whether inactive products appear in public catalog reads. Add route/service coverage for validation, error mapping, deletion restrictions, seeding, and access control. No test files or test script are currently present.

The separate `prisma-8.md` guide contains generic `Post`/`username` examples and does not describe the current ecommerce contract; update or clearly label it if it is intended as project documentation.
