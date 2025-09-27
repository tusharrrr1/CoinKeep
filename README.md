# CoinKeep

## Frontend Auth (Prototype)

Implements two sign-in modes:

1. Email + Organization (mock, localStorage only)
2. Sign-In With Ethereum (SIWE) prototype using `ethers` + `siwe` and a placeholder local signature store.

### Supabase Preparation (for productionizing SIWE)

1. Create a Supabase project.
2. Copy project URL and anon key into a `.env.local` in `frontend/`:

```
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

3. (Recommended) Create an Edge Function `siwe-auth` that: 
	- Accepts `{ message, signature }`.
	- Validates with `siwe` library.
	- Uses address as user identifier (lowercased) and issues a JWT via `supabase.auth.admin.createUser()` / `generateLink` flow or uses `auth.signInWithIdToken` custom provider approach.

Front-end placeholder currently: stores `{ address, signature, siwe }` in localStorage and calls it a session. Replace this with a call to the Edge Function returning a Supabase session.

### Switching Modes

On the email login screen a floating button "Sign in w/ Ethereum" toggles to SIWE mode.

### TODO (Not yet implemented)

- Real nonce retrieval & storage (server-side, single-use).
- Signature verification on backend & secure Supabase session issuance.
- Wallet disconnect / session revoke.
- Multi-org mapping for a wallet.

### Dev

```
cd frontend
npm install
npm run start
```

---
This file will expand as backend + Edge Function pieces are added.