# Supabase Migration Setup

## Configuration Created

1. **supabase/config.toml** - Supabase local configuration file
2. **Migration file**: `supabase/migrations/20240322000000_create_all_tables.sql`

## Environment Variables

The following environment variables are configured in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_KEY` - Supabase publishable key
- `NEXT_PUBLIC_SUPABASE_PROJECT_ID` - Project ID: `ripcvdgfrecjhtgverdv`
- `NEXT_SUPABASE_SECRET_KEY` - Supabase secret key
- `NEXT_SUPABASE_DB_PASSWORD` - Database password: `IDG5YFjDPOGIteFX`

## To Sync Migration to Supabase

Due to network connectivity issues with the CLI, you have two options:

### Option 1: Run Migration via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/ripcvdgfrecjhtgverdv
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20240322000000_create_all_tables.sql`
4. Paste into the SQL Editor and click **Run**

### Option 2: Use Supabase CLI (Once Network Issue is Resolved)

If your network allows connection to the database:

```bash
# Link the project (will prompt for password)
supabase link --project-ref ripcvdgfrecjhtgverdv
# Enter password when prompted: IDG5YFjDPOGIteFX

# Push migrations
supabase db push
```

### Option 3: Manual psql Connection

If you have direct database access:

```bash
PGPASSWORD=IDG5YFjDPOGIteFX psql \
  "postgresql://postgres.ripcvdgfrecjhtgverdv:IDG5YFjDPOGIteFX@db.ripcvdgfrecjhtgverdv.supabase.co:5432/postgres" \
  -f supabase/migrations/20240322000000_create_all_tables.sql
```

## Migration Summary

The migration creates the following tables:

- **customers** - Customer management
- **products** - Product catalog
- **inventory** - Inventory tracking with cost prices
- **orders** - Order management
- **order_items** - Order-product relationships

Plus two enums:

- **Order Status** - pending, fulfilled, canceled
- **Product Type** - keys, tools, parts
