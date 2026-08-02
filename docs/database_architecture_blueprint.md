# Horizon OS: Relational Database Blueprint
### Database Architecture, Prisma Schema, and Performance Strategy

---

## 1. Relational Database Design & Normalization

This PostgreSQL database is designed to support a highly relational SaaS platform. It strictly enforces **3rd Normal Form (3NF)** to ensure absolute data integrity, zero redundancy, and efficient scaling.

### Key Architectural Standards
1. **UUID Primary Keys:** All tables use random UUIDs (`gen_random_uuid()`) to prevent ID enumeration attacks and enable safe client-side UUID generation.
2. **Standard Audit Metadata:** Every transactional table includes `createdAt` and `updatedAt` timestamps.
3. **Optimistic Concurrency & Soft Deletes:** Critical business items include a nullable `deletedAt` timestamp. Query indices automatically filter on `deletedAt IS NULL`.
4. **Data Isolation (RLS-Ready):** Every user-owned table has a direct `userId` foreign key. This makes implementing Supabase Row Level Security (RLS) direct and simple (`auth.uid() = user_id`).

---

## 2. Detailed Entity Explanation

### Identity & Sessions
* **`User`**: Core user account table storing authentication credentials (password hashes, 2FA status, and third-party login linkages). Soft deletes (`deletedAt`) ensure accounts are protected while allowing a 30-day recovery grace period.
* **`Profile`**: Contains user display parameters (full name, timezone, custom levels, and experience points). Separated from `User` to optimize authentication index lookup performance.
* **`Role` & `Permission`**: Power a high-performance **Role-Based Access Control (RBAC)** security system. Permits permissions (e.g. `read:note`) to be grouped in roles (e.g. `PremiumMember`), linked together via joint lookup tables `UserRole` and `RolePermission`.
* **`Session` & `RefreshToken`**: Handles user login sessions. Storing refresh tokens explicitly allows the system to revoke suspicious devices immediately without waiting for token expirations.

### Audit Trailing
* **`AuditLog`**: Stores JSON representations of table mutations (`oldValues` and `newValues`). Useful for tracing security infractions, data loss issues, or changes made by administrators.

### Chronos Module (Time & Task)
* **`TodoList` & `Task`**: The tasks table. Each task can be linked to a parent `TodoList` or a high-level `Project`. A task supports categories, priority levels, and file uploads.
* **`Project`**: High-level parent groupings of tasks with associated tagging.

### Athena Module (Knowledge Engine)
* **`Idea`**: A simplified inbound Inbox for logging quick, unsorted notes that can be converted into standard tasks or notes later.
* **`Note`**: Stores rich text or block-level JSON editor structures. Can be categorized with `Tag` tags or published to public streams.
* **`Book` / `Author` / `ReadingProgress`**: Manages reading challenges. A many-to-many lookup table `BookAuthor` connects books and authors, and the `ReadingProgress` record acts as the active user tracker.

### Odyssey Module (Journeys & Health)
* **`TravelPlan`**: Stores JSON itineraries containing travel destinations, maps, and packing arrangements.
* **`WorkoutProgram` & `Exercise`**: Holds physical fitness programs. The many-to-many table `ProgramExercise` records sets, reps, and target rest limits.
* **`BodyMeasurement`**: Tracks physiological data points (weight, fat percentage, measurements) over time to visualize fitness changes.

### Ledger Module (Finance)
* **`ExpenseCategory`**: Groups financial items (e.g. "Rent", "Dining").
* **`Transaction`**: Records outflows and inflows with high Decimal precision.
* **`Budget`**: Enforces strict financial spending boundaries over weekly or monthly periods.
* **`SavingsGoal`**: Tracks target saving markers.

### Habits Engine
* **`Habit` & `HabitTracking`**: Monitors daily and weekly routines. Toggling a habit creates a `HabitTracking` entry, which computes and updates current and historical streaks inside the `Habit` model.

### Gamification & Alerts
* **`Achievement` & `UserAchievement`**: Unlocks milestone awards.
* **`Notification`**: Standard inbox warning alert mechanism.

### Social & Media Modules
* **`Attachment`**: File assets uploaded to AWS S3 / Supabase Storage buckets, linked to parent tasks or private notes.
* **`PublicPost`**: Exposes a note to followers.
* **`Comment` & `Like`**: Provides interactive engagement on public posts or tasks.
* **`Follow`**: High-performance self-referential table linking user IDs to map follower/following graphs.
* **`Message`**: Direct private messages.
* **`Tag` / `NoteTag` / `ProjectTag`**: Tagging matrices.
* **`Media`**: Generic static file assets.
* **`AIRecommendation`**: Stores custom suggestions from Aether AI (e.g. Finance alerts, goal adjustments).

---

## 3. Query Indexing Strategy

To scale efficiently to millions of users, this database is optimized at the query layer with strategic single-column and composite indexes.

1. **Foreign Key Indexing:** Every relational foreign key column has an explicit index (e.g., `@@index([userId])`). This prevents full table scans on queries resolving parent-child relations.
2. **Soft Delete Filtering:** The `deletedAt` column is indexed on tables supporting soft deletes. Queries are generated with a default clause `deletedAt = null`, which uses the index to ignore deleted rows.
3. **Composite Security Indexes:**
   - `AuditLog`: `@@index([entityName, entityId])` speeds up retrieval of historical logs for specific items.
   - `HabitTracking`: `@@unique([habitId, logDate])` enforces a unique constraint, preventing double check-ins on the same day while acting as an lookup index.
   - `ReadingProgress`: `@@unique([userId, bookId])` guarantees users only have one reading progress tracker per book.

---

## 4. Relationships & Cascading Rules

Prisma relationships are configured with strict reference policies to prevent database inconsistencies:

* **Cascade Deletes (`onDelete: Cascade`):** 
  - If a `User` account is fully purged, all associated `Profile`, `Session`, `RefreshToken`, `Task`, `Note`, `Transaction`, and `Habit` rows are immediately purged. This ensures complete database cleanup and privacy compliance (GDPR/CCPA).
  - Joining records like `BookAuthor` or `ProjectTag` delete automatically if their parent books/projects are removed.
* **Restricted Deletes (`onDelete: SetNull`):**
  - If a `TodoList`, `TaskCategory`, or `Project` is deleted, associated `Task` records have their relation fields set to `null` instead of being deleted. This protects task notes from accidental cascade failures.
  - If a `User` is deleted, their entries in the `AuditLog` are kept but marked with a null `userId` to preserve historical operational records.
* **Explicit Join Tables:** Many-to-many relations (such as `UserRole`, `RolePermission`, `BookAuthor`, `ProgramExercise`, `NoteTag`, and `ProjectTag`) use explicit join tables. This guarantees indexing control and query flexibility without relying on implicit ORM generation.
