# PostgreSQL Database Setup Guide

## Prerequisites

You need PostgreSQL installed on your machine. If you don't have it:

### macOS
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Or using Postgres.app
# Download from https://postgresapp.com/
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

## Quick Setup

### 1. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE boothmark;

# Create user (optional, for production)
CREATE USER boothmark_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE boothmark TO boothmark_user;

# Exit psql
\q
```

### 2. Run Schema

```bash
# From the project root directory
psql boothmark < database/schema.sql
```

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and update the DATABASE_URL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/boothmark"
# Or if you created a user:
# DATABASE_URL="postgresql://boothmark_user:your_secure_password@localhost:5432/boothmark"
```

## Verify Setup

```bash
# Connect to your database
psql boothmark

# List all tables
\dt

# You should see:
# - users
# - user_settings
# - career_fairs
# - prep_checklist_items
# - companies

# Check table structure
\d companies

# Exit
\q
```

## Database Schema Overview

### Tables

**users**
- Primary authentication table
- Stores email, name, password hash
- Email verification status

**user_settings**
- User-specific settings (1-to-1 with users)
- Encrypted OpenAI API key
- Default scan method preference

**career_fairs**
- Career fair events
- Linked to users
- Name, date, location, venue map

**prep_checklist_items**
- Pre-event preparation checklist
- Linked to career fairs
- Default items + custom items

**companies**
- Core data model
- Extracted information from scans
- User notes and follow-up tracking
- Voice notes stored as JSONB

### Key Features

- **UUID Primary Keys**: Using `uuid-ossp` extension for unique IDs
- **Full-Text Search**: GIN index on companies for fast search
- **Triggers**: Auto-update `updated_at` timestamps
- **Cascading Deletes**: Remove related data when parent is deleted
- **Array & JSONB Support**: For flexible data structures (positions, tags, voice notes)

## Common Operations

### Reset Database

```bash
# Drop and recreate database
psql postgres
DROP DATABASE boothmark;
CREATE DATABASE boothmark;
\q

# Re-run schema
psql boothmark < database/schema.sql
```

### Backup Database

```bash
pg_dump boothmark > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql boothmark < backup_20250101.sql
```

### View Data

```sql
-- Count users
SELECT COUNT(*) FROM users;

-- List career fairs with user info
SELECT cf.name, cf.date, u.email
FROM career_fairs cf
JOIN users u ON cf.user_id = u.id
ORDER BY cf.date DESC;

-- Companies by priority
SELECT company_name, priority, created_at
FROM companies
WHERE priority = 'high'
ORDER BY created_at DESC;

-- Full-text search example
SELECT company_name, positions
FROM companies
WHERE to_tsvector('english',
    coalesce(company_name, '') || ' ' ||
    coalesce(array_to_string(positions, ' '), '')
) @@ to_tsquery('english', 'software & engineer');
```

## Next Steps

1. Install a PostgreSQL client library for your backend (when ready):
   ```bash
   npm install pg
   # or
   npm install @prisma/client prisma
   ```

2. Create API routes to interact with the database

3. Implement authentication and session management

4. Set up connection pooling for production

## Troubleshooting

**Connection refused?**
- Make sure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check your connection URL in `.env`

**Permission denied?**
- You may need to update `pg_hba.conf` to allow password authentication
- Or run `psql` as the postgres user: `sudo -u postgres psql`

**Tables not created?**
- Check for errors when running the schema: `psql boothmark < database/schema.sql 2>&1 | tee schema_errors.log`

## Security Notes

⚠️ **Important for Production:**

1. Change default passwords
2. Use environment variables for sensitive data
3. Enable SSL connections
4. Implement proper authentication and authorization
5. Use prepared statements to prevent SQL injection
6. Regularly backup your database
7. Encrypt OpenAI API keys before storing

## Database URL Format

```
postgresql://[user]:[password]@[host]:[port]/[database]

Examples:
postgresql://postgres:password@localhost:5432/boothmark
postgresql://user:pass@db.example.com:5432/boothmark?sslmode=require
```

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [pgAdmin](https://www.pgadmin.org/) - Database management tool
