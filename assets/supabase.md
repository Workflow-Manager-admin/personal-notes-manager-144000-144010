# Supabase Integration for Notes Frontend

This React application uses [Supabase](https://supabase.com/) as the backend for storing notes. 

## Environment Variables

You must set the following environment variables in the `.env` file at the root of the React project:

- `REACT_APP_SUPABASE_URL`: The URL of your Supabase project.
- `REACT_APP_SUPABASE_KEY`: The Supabase "anon public" API key.

## Required Table Structure

The application expects a table called `notes` with at minimum the following fields:
- `id`: UUID or integer (Primary key, auto-generated)
- `title`: String
- `content`: String (Text)
- `updated_at`: Timestamp (auto-updated on modification)

**Example .env:**
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=your-supabase-public-anon-key
```

## Supabase Schema Verification

**Schema as currently found in Supabase:**
- `id` (uuid, primary key)
- `title` (text, required)
- `body` (text, nullable)
- `category` (text, nullable)
- `created_at` (timestamp with time zone, default now())
- `updated_at` (timestamp with time zone, nullable)

**Important Note:**  
The frontend code (and this documentation) expects a column named `content`, but the actual column present is `body`.  
You must either:
- Use the `body` column in your React app for all note content (rename all `content` usages in code to `body`), or
- Update your Supabase schema to include a `content` column instead of (or alongside) `body`.

**Current frontend code expects to use:**
```js
// e.g.
supabase
  .from('notes')
  .insert({ title, content: '...' })
  .select("*")
```
If you do not align the schema, CRUD operations will not work as expected.

## Usage in Code

Supabase is initialized in `src/App.js`:
```js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// CRUD operations performed on the 'notes' table.
```

## Running Locally

1. Ensure you have the required environment variables.
2. `npm install`
3. `npm start`
4. The frontend will connect directly to your Supabase backend.

## Resolution Steps

- Make sure the field mapping (`content` vs `body`) is resolved in your application or backend before proceeding with production use.
- No authentication is implemented; notes are public to all users of the frontend.
