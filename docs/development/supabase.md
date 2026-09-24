# Supabase development setup

DriverOps uses a dedicated Supabase project for managed PostgreSQL and authentication.

## Project configuration

- Project: DriverOps
- Region: `eu-west-2` (London)
- PostgreSQL: standard Postgres
- Data API: disabled
- Automatic table exposure: disabled
- Automatic RLS: disabled
- Authentication: email and password
- Email confirmation: enabled

DriverOps application tables must not be created manually through the Supabase dashboard. Prisma Migrate is the authoritative source for application-schema changes.

## Local environment

Copy the API environment template:

`cp apps/api/.env.example apps/api/.env`

On Windows Command Prompt:

`copy apps\api\.env.example apps\api\.env`

Populate `apps/api/.env` with the following variables:

- `DATABASE_URL` — PostgreSQL connection string used by the application.
- `DIRECT_URL` — direct PostgreSQL connection used for schema-management operations such as migrations.
- `SUPABASE_URL` — Supabase project URL.
- `SUPABASE_PUBLISHABLE_KEY` — Supabase publishable API key used for authentication integration.

Never commit `apps/api/.env`, database passwords, secret keys, or service-role keys.

## Database connections

Connection strings are available from the Supabase dashboard through **Connect**.

For local application development, use the shared pooler's session-mode connection when IPv4 compatibility is required.

For migration and database-management operations, prefer the direct PostgreSQL connection when the development environment supports IPv6.

The exact Prisma connection configuration will be established in the Prisma setup task.
