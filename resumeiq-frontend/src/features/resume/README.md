# features/resume

Feature module boundary. When this feature is built out, it should contain:

- `components/` — UI local to this feature only
- `api.ts` — axios calls for this feature's endpoints (imports `@/services/apiClient`)
- `hooks.ts` — React Query hooks (useQuery/useMutation) wrapping api.ts
- `types.ts` — feature-local types not shared globally (shared ones live in `@/types`)

Left empty intentionally — foundation phase only.
