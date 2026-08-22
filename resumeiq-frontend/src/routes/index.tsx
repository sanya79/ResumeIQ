import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LandingPage } from "@/pages/landing/LandingPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ResumeWorkspacePage } from "@/pages/resume/ResumeWorkspacePage";
import { AtsIntelligencePage } from "@/pages/ats/AtsIntelligencePage";
import { JobMatchingPage } from "@/pages/matching/JobMatchingPage";
import { CareerRoadmapPage } from "@/pages/career/CareerRoadmapPage";
import { GitHubPortfolioPage } from "@/pages/portfolio/GitHubPortfolioPage";
import { InterviewPage } from "@/pages/interview/InterviewPage";
import { AnalyticsPage } from "@/pages/analytics/AnalyticsPage";
import { HistoryPage } from "@/pages/history/HistoryPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { RecruiterDashboardPage } from "@/pages/recruiter/RecruiterDashboardPage";
import { UnauthorizedPage } from "@/pages/errors/UnauthorizedPage";
import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { GuestRoute } from "./GuestRoute";

/**
 * Route tree. Dashboard, Resume Analysis, ATS Intelligence, Job Matching,
 * Career Roadmap (Skill Gap Analysis), Interview Preparation, Analytics,
 * History, and Settings are all wired in.
 */
export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },

  // Guest-only: redirects to /dashboard if already authenticated.
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
        ],
      },
    ],
  },

  // Reachable regardless of auth state — a user may land here immediately
  // after registering, before their session/verification status settles.
  {
    element: <AuthLayout />,
    children: [{ path: "/verify-email", element: <VerifyEmailPage /> }],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/resumes", element: <ResumeWorkspacePage /> },
          { path: "/resumes/upload", element: <ResumeWorkspacePage /> },
          { path: "/ats", element: <AtsIntelligencePage /> },
          { path: "/ats/:resumeId", element: <AtsIntelligencePage /> },
          { path: "/matching", element: <JobMatchingPage /> },
          { path: "/skill-gap", element: <CareerRoadmapPage /> },
          { path: "/portfolio/github", element: <GitHubPortfolioPage /> },
          { path: "/interview", element: <InterviewPage /> },
          { path: "/analytics", element: <AnalyticsPage /> },
          { path: "/history", element: <HistoryPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["RECRUITER"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: "/recruiter/dashboard", element: <RecruiterDashboardPage /> }],
      },
    ],
  },

  { path: "/403", element: <UnauthorizedPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
