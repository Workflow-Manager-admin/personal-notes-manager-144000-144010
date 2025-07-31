# Supabase Integration for Notes Frontend

This React application uses [Supabase](https://supabase.com/) as the backend for storing notes. You must set the following environment variables in the `.env` file at the root of the React project:

- `REACT_APP_SUPABASE_URL`: The URL of your Supabase project.
- `REACT_APP_SUPABASE_KEY`: The Supabase "anon public" API key.

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

The Supabase client is initialized once and used for CRUD operations (list, create, edit, delete) on the `notes` table. No authentication is implemented; notes are public to all users of the frontend.

## Running Locally

1. Ensure you have the required environment variables.
2. `npm install`
3. `npm start`
4. The frontend will connect directly to your Supabase backend.

## Usage in Code

Supabase is initialized in `src/App.js`:
```js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// CRUD operations performed on the 'notes' table.
```
