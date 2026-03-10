// ============================================================
// Layout.tsx — B2G Intelligence Hub
// Design: 行政インテリジェンス・ポータル
// Fixed left sidebar (240px navy) + scrollable main area
// ============================================================

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Search,
  MessageSquareMore,
  BookOpen,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  TrendingUp,
  Users,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { path: "/", icon: LayoutDashboard, label: "ダッシュボード" },
  { path: "/tender", icon: Search, label: "入札・予算リサーチ", badge: "247" },
  { path: "/strategy", icon: MessageSquareMore, label: "AI戦略室（壁打ち）" },
  { path: "/knowledge", icon: BookOpen, label: "ナレッジベース" },
];

const bottomNavItems: NavItem[] = [
  { path: "/notifications", icon: Bell, label: "通知", badge: "3" },
  { path: "/settings", icon: Settings, label: "設定" },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
        style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)", position: "relative" }}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, oklch(0.52 0.22 258), oklch(0.42 0.22 258))" }}
              >
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white leading-tight truncate">B2G Intelligence</div>
                <div className="text-xs leading-tight" style={{ color: "oklch(0.60 0.08 247)" }}>自治体営業支援</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.22 258), oklch(0.42 0.22 258))" }}
            >
              <Building2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.50 0.05 247)" }}>
                メインメニュー
              </span>
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 cursor-pointer",
                    isActive
                      ? "text-white"
                      : "hover:text-white"
                  )}
                  style={
                    isActive
                      ? {
                          background: "oklch(0.52 0.22 258 / 0.25)",
                          color: "oklch(0.82 0.15 258)",
                          borderLeft: "3px solid oklch(0.60 0.22 258)",
                          paddingLeft: "calc(0.75rem - 3px)",
                        }
                      : { color: "oklch(0.72 0.04 247)" }
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge
                          className="text-xs px-1.5 py-0 h-5 font-mono-data"
                          style={{
                            background: isActive ? "oklch(0.52 0.22 258 / 0.4)" : "oklch(0.30 0.06 245)",
                            color: isActive ? "oklch(0.82 0.15 258)" : "oklch(0.65 0.05 247)",
                            border: "none",
                          }}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}


        </nav>

        {/* Bottom Nav */}
        <div className="px-2 py-3 border-t space-y-1" style={{ borderColor: "var(--sidebar-border)" }}>
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors hover:text-white"
                  style={isActive
                    ? { background: "oklch(0.52 0.22 258 / 0.25)", color: "oklch(0.82 0.15 258)" }
                    : { color: "oklch(0.65 0.04 247)" }
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge className="text-xs px-1.5 py-0 h-5" style={{ background: "oklch(0.577 0.245 27.325 / 0.3)", color: "oklch(0.80 0.18 27)", border: "none" }}>
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}

          {/* User Profile */}
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-md" style={{ background: "oklch(0.28 0.07 245)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: "oklch(0.52 0.22 258)" }}>
                田
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">田中 太郎</div>
                <div className="text-xs truncate" style={{ color: "oklch(0.60 0.05 247)" }}>営業部 主任</div>
              </div>
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.60 0.05 247)" }} />
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors z-10"
          style={{ background: "oklch(0.35 0.10 245)", border: "1px solid oklch(0.40 0.08 245)", color: "oklch(0.80 0.05 247)" }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header
          className="h-16 flex items-center justify-between px-6 flex-shrink-0"
          style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full status-dot-active" style={{ display: "inline-block", background: "oklch(0.65 0.18 145)", boxShadow: "0 0 0 3px oklch(0.65 0.18 145 / 0.2)" }} />
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              データ最終更新: 2026年3月10日 09:00
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
              官公需情報ポータル
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-mono-data" style={{ background: "oklch(0.65 0.18 145 / 0.15)", color: "oklch(0.55 0.18 145)" }}>
                接続中
              </span>
            </div>
            <div className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
              Gemini AI
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-mono-data" style={{ background: "oklch(0.65 0.18 145 / 0.15)", color: "oklch(0.45 0.18 145)" }}>
                接続済み
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="page-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
