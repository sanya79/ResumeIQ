# ResumeIQ Frontend — Foundation

React 18 + Vite + TypeScript + Tailwind + Framer Motion + Zustand + React
Router + Axios + React Query.

## Status
Foundation only. No pages, no dashboard, no landing page yet.

## ⚠️ Backend contract assumption
No backend API spec/OpenAPI doc was provided at scaffold time. The types in
`src/types/` and the `ApiResponse<T>` envelope in `src/types/api.ts` are
reasonable placeholders inferred from the five stated feature domains
(auth, resume, ats, matching, interview). Share the real API docs /
OpenAPI schema before building `features/*/api.ts` files so requests,
response shapes, and error formats match exactly.

## Run
npm install
cp .env.example .env
npm run dev
