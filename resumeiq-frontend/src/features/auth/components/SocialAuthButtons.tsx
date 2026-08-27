import { API_BASE_URL } from "@/utils/constants";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { useAuthStore } from "@/stores/authStore";

export function SocialAuthButtons() {
  const isLoading = useAuthStore((s) => s.isLoading);

  const handleSocialClick = (provider: "google" | "github") => {
    const redirectUri = `${window.location.origin}/login`;
    const state = provider; // Pass provider as state for callback identification
    const targetUrl = API_BASE_URL.startsWith("http")
      ? `${API_BASE_URL}/auth/${provider}?state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`
      : `${window.location.origin}${API_BASE_URL}/auth/${provider}?state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = targetUrl;
  };

  return (
    <div className="flex flex-col gap-4">
      <Divider label="or continue with" />
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" size="md" disabled={isLoading} onClick={() => handleSocialClick("google")}>
          <GoogleIcon />
          Google
        </Button>
        <Button type="button" variant="outline" size="md" disabled={isLoading} onClick={() => handleSocialClick("github")}>
          <GitHubIcon />
          GitHub
        </Button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.68 4.1-5.5 4.1-3.31 0-6-2.74-6-6.2s2.69-6.2 6-6.2c1.88 0 3.14.8 3.86 1.49l2.63-2.53C16.9 3.05 14.7 2 12 2 6.98 2 2.9 6.03 2.9 11s4.08 9 9.1 9c5.25 0 8.74-3.69 8.74-8.89 0-.6-.07-1.05-.15-1.5H12z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.36-3.37-1.36-.45-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.28 9.28 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.8-4.58 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}
