import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  ScanSearch,
  Target,
  Puzzle,
  MessagesSquare,
  BarChart3,
  History,
  Settings,
} from "lucide-react";
import type { SidebarItem } from "./Sidebar";

/**
 * Single source of truth for the authenticated app's primary navigation —
 * consumed by Sidebar (desktop rail) and can be reused by any future
 * mobile nav / command palette without redefining the list.
 */
export const primaryNavItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Resume Analysis", href: "/resumes", icon: <FileText size={18} /> },
  { label: "Upload Resume", href: "/resumes/upload", icon: <UploadCloud size={18} /> },
  { label: "ATS Intelligence", href: "/ats", icon: <ScanSearch size={18} /> },
  { label: "Job Matching", href: "/matching", icon: <Target size={18} /> },
  { label: "Skill Gap", href: "/skill-gap", icon: <Puzzle size={18} /> },
  { label: "Interview AI", href: "/interview", icon: <MessagesSquare size={18} /> },
  { label: "Analytics", href: "/analytics", icon: <BarChart3 size={18} /> },
  { label: "History", href: "/history", icon: <History size={18} /> },
  { label: "Settings", href: "/settings", icon: <Settings size={18} /> },
];
