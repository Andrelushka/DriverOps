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

- `DATABASE_URL` — PostgreSQL connection used by the running application.
- `DIRECT_URL` — PostgreSQL connection used by Prisma schema-management and migration commands.
- `SUPABASE_URL` — Supabase project URL.
- `SUPABASE_PUBLISHABLE_KEY` — Supabase publishable API key used for authentication integration.

Never commit `apps/api/.env`, database passwords, secret keys, or service-role keys.

## Database connections

Connection strings are available from the Supabase dashboard through **Connect**.

For local application development, use the shared pooler's session-mode connection on port `5432` when IPv4 compatibility is required.

Prisma migration commands use `DIRECT_URL`. This can use the direct PostgreSQL connection when IPv6 connectivity is available, or the shared pooler's session-mode connection on port `5432` when it is not.

Do not use the transaction-mode pooler on port `6543` for Prisma migrations.

Prisma Migrate is the authoritative mechanism for DriverOps application-schema changes. Application tables must not be created manually through the Supabase dashboard.
