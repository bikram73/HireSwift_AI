import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { CandidateProfile, WorkspaceRoute } from '../data/atsData';
import { useAts } from '../context/AtsContext';

interface WorkspaceShellProps {
  activeRoute: WorkspaceRoute;
  onNavigate: (route: WorkspaceRoute) => void;
  onGoLanding: () => void;
  onSelectCandidate: (candidate: CandidateProfile) => void;
  children: React.ReactNode;
}

const WORKSPACE_NAV: { id: WorkspaceRoute; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'candidates', label: 'Candidates', icon: 'group' },
  { id: 'resume-upload', label: 'Resume Upload', icon: 'upload_file' },
  { id: 'job-management', label: 'Job Management', icon: 'work' },
  { id: 'ai-matching', label: 'AI Matching', icon: 'psychology' },
  { id: 'candidate-ranking', label: 'Candidate Ranking', icon: 'leaderboard' },
  { id: 'hiring-pipeline', label: 'Hiring Pipeline', icon: 'view_kanban' },
  { id: 'compare-candidates', label: 'Compare Candidates', icon: 'compare_arrows' },
  { id: 'skill-gap-analysis', label: 'Skill Gap Analysis', icon: 'troubleshoot' },
  { id: 'email-center', label: 'Email Center', icon: 'mark_email_unread' },
  { id: 'reports', label: 'Reports', icon: 'insights' },
];

const BOTTOM_NAV: { id: WorkspaceRoute; label: string; icon: string }[] = [
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'help-center', label: 'Help Center', icon: 'help' },
];

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  activeRoute,
  onNavigate,
  onGoLanding,
  onSelectCandidate,
  children,
}) => {
  const { candidates, jobs, activities, theme, toggleTheme, setSelectedJobId } = useAts();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);
  const [activeOrg, setActiveOrg] = useState('Acme Corp');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
        setNotifOpen(false);
        setOrgOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const currentNavLabel =
    activeRoute === 'job-details'
      ? 'Job Details'
      : [...WORKSPACE_NAV, ...BOTTOM_NAV].find((n) => n.id === activeRoute)?.label ?? 'Workspace';

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(cmdQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(cmdQuery.toLowerCase()))
  );

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  const renderSidebarContent = () => (
    <>
      <div className="flex flex-col">
        <div
          onClick={onGoLanding}
          className="h-16 px-space-xl flex items-center gap-3 border-b border-[#263449]/70 bg-[#0B1020]/90 cursor-pointer hover:bg-[#151E32]/60 transition-colors group"
          title="Back to HireSwift AI Landing Page"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-base tracking-tight text-white leading-none">
                HireSwift<span className="text-[#8B5CF6]">AI</span>
              </span>
              <span className="text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                ATS
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-[#94A3B8] font-medium mt-1">
              AI Recruitment
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-space-md">
          <div className="px-space-md py-1 font-label-sm text-label-sm text-[#94A3B8]/70 uppercase tracking-wider">
            Workspace
          </div>
          {WORKSPACE_NAV.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-space-md px-space-md py-2 rounded-xl transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-semibold shadow-lg shadow-indigo-600/25 border border-white/15'
                    : 'font-body-sm text-body-sm text-[#94A3B8] hover:bg-[#151E32] hover:text-white border border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-space-md border-t border-[#263449]/70 bg-[#0B1020]/70 flex flex-col gap-1">
        <nav className="flex flex-col gap-1">
          {BOTTOM_NAV.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-space-md px-space-md py-2 rounded-xl transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-semibold shadow-lg shadow-indigo-600/25 border border-white/15'
                    : 'font-body-sm text-body-sm text-[#94A3B8] hover:bg-[#151E32] hover:text-white border border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center justify-between px-space-md py-2 mt-1">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-[#94A3B8]">
            <span className="material-symbols-outlined text-[16px]">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
            <span>Theme</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center bg-[#151E32] rounded-full p-0.5 border border-[#263449] cursor-pointer"
            title="Switch Dark / Light theme"
          >
            <span
              className={`px-2 py-0.5 rounded-full font-mono-code text-[10px] transition-colors ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white'
                  : 'text-[#94A3B8]'
              }`}
            >
              Dark
            </span>
            <span
              className={`px-2 py-0.5 rounded-full font-mono-code text-[10px] transition-colors ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white'
                  : 'text-[#94A3B8]'
              }`}
            >
              Light
            </span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-[#0B1020] font-body-md text-[#F8FAFC] antialiased min-h-screen">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[250px] bg-[#0B1020]/95 backdrop-blur-xl border-r border-[#263449]/80 z-40 flex-col justify-between overflow-y-auto">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-[250px] h-full bg-surface-container-low border-r border-outline-variant/30 z-10 flex flex-col justify-between overflow-y-auto">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="lg:pl-[250px]">
        {/* Fixed Top Header */}
        <header className="fixed top-0 left-0 lg:left-[250px] right-0 h-16 bg-[#0B1020]/80 backdrop-blur-xl border-b border-[#263449]/70 z-30 px-4 lg:px-gutter-desktop flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 lg:gap-space-lg min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#151E32] hover:text-white cursor-pointer"
              aria-label="Open navigation menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <button
              type="button"
              onClick={onGoLanding}
              className="flex items-center gap-2 cursor-pointer shrink-0 group"
              title="View Landing Page"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#4F46E5] to-[#8B5CF6] flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </button>
            <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-[#94A3B8] truncate">
              <button
                type="button"
                onClick={onGoLanding}
                className="text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
              >
                Home
              </button>
              <span className="text-[#263449]">/</span>
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="text-white font-semibold hover:text-[#8B5CF6] transition-colors cursor-pointer"
              >
                HireSwift
              </button>
              <span className="text-[#263449]">/</span>
              <span className="text-[#8B5CF6] font-semibold truncate">{currentNavLabel}</span>
            </div>
          </div>

          {/* Search Command Bar */}
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="hidden md:flex items-center w-80 lg:w-96 px-space-md py-1.5 bg-[#151E32]/85 rounded-xl border border-[#263449] text-[#94A3B8] hover:border-[#8B5CF6]/60 transition-all cursor-pointer text-left"
          >
            <span className="material-symbols-outlined text-[18px] text-[#94A3B8] mr-2">search</span>
            <span className="font-body-sm text-body-sm text-[#94A3B8] flex-1 truncate">
              Search candidates, jobs, skills...
            </span>
            <kbd className="font-mono-code text-[11px] px-1.5 py-0.5 rounded bg-[#1B2740] border border-[#263449] text-[#F8FAFC]">
              ⌘K
            </kbd>
          </button>

          {/* Header Right Controls */}
          <div className="flex items-center gap-2 sm:gap-space-md shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('resume-upload')}
              className="flex items-center gap-space-xs px-3.5 py-1.5 bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] hover:opacity-95 text-white rounded-xl font-label-md text-label-md font-semibold transition-all shadow-lg shadow-indigo-600/25 border border-white/15 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span className="hidden sm:inline">+ Analyze Resumes</span>
              <span className="sm:hidden">+ Analyze</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((p) => !p);
                  setOrgOpen(false);
                }}
                className="relative flex items-center justify-center p-2 rounded-xl bg-[#151E32]/60 border border-[#263449]/80 text-[#94A3B8] hover:bg-[#1B2740] hover:text-white transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0B1020]" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl glass-card shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#263449]">
                    <span className="font-headline-sm text-white">Recent Updates</span>
                    <span className="font-mono-code text-[10px] text-[#3B82F6]">
                      {Math.min(activities.length, 4)} UPDATES
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs max-h-64 overflow-y-auto">
                    {activities.slice(0, 4).map((act) => (
                      <div key={act.id} className="p-2.5 rounded-lg bg-[#0B1020]/70 border border-[#263449]/60">
                        <p className="text-white font-medium">{act.title}</p>
                        <span className="text-[#94A3B8] font-mono-code text-[10px]">
                          {act.time} · {act.detail}
                        </span>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <p className="text-[#94A3B8] py-2 text-center">No recent activity in this session.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:block h-6 w-px bg-outline-variant/30 mx-1" />

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOrgOpen((p) => !p);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-space-xs px-2.5 py-1.5 rounded-xl bg-[#151E32]/85 border border-[#263449] cursor-pointer hover:bg-[#1B2740] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#8B5CF6]">business</span>
                <span className="font-body-sm text-body-sm text-[#F8FAFC] font-medium hidden sm:inline whitespace-nowrap">
                  {activeOrg}
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#94A3B8]">arrow_drop_down</span>
              </button>

              {orgOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl glass-card shadow-2xl p-1.5 z-50">
                  {['Acme Corp', 'SynapticLabs', 'NodeCraft Talent'].map((org) => (
                    <button
                      key={org}
                      type="button"
                      onClick={() => {
                        setActiveOrg(org);
                        setOrgOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        activeOrg === org
                          ? 'bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white'
                          : 'text-[#94A3B8] hover:bg-[#1B2740] hover:text-white'
                      }`}
                    >
                      {org}
                    </button>
                  ))}
                  <div className="my-1 border-t border-[#263449]" />
                  <button
                    type="button"
                    onClick={onGoLanding}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#3B82F6] hover:bg-[#1B2740] transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[15px]">public</span>
                    <span>View Landing Page</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="w-8 h-8 rounded-xl bg-[#151E32] border border-[#263449] hover:border-[#8B5CF6]/60 flex items-center justify-center cursor-pointer transition-colors"
              title="Workspace Settings"
            >
              <span className="material-symbols-outlined text-[#F8FAFC] text-[18px]">settings</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="relative pt-16 bg-[#0B1020] subtle-grid min-h-screen p-4 sm:p-6 lg:p-margin-desktop overflow-x-hidden">
          <div className="pointer-events-none fixed top-16 left-0 lg:left-[250px] right-0 h-[420px] glow-conic blur-3xl opacity-60" />
          <div className="pt-4 relative z-10">{children}</div>
        </main>
      </div>

      {/* Global Command Search Modal (Cmd+K) */}
      {cmdOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={() => setCmdOpen(false)} />
          <div className="relative w-full max-w-xl rounded-2xl bg-surface-container border border-outline-variant/40 shadow-2xl overflow-hidden z-10">
            <div className="flex items-center px-4 py-3 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-outline mr-3">search</span>
              <input
                autoFocus
                type="text"
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Jump to candidate, job posting, or workspace screen..."
                className="flex-1 bg-transparent text-on-surface placeholder:text-outline outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setCmdOpen(false)}
                className="font-mono-code text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-3 space-y-4">
              <div>
                <div className="px-2 pb-1.5 font-label-sm text-outline uppercase tracking-wider">
                  Quick Navigation
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {WORKSPACE_NAV.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        setCmdOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-left text-xs text-on-surface cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {filteredCandidates.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 font-label-sm text-outline uppercase tracking-wider">
                    Matching Candidates
                  </div>
                  <div className="space-y-1">
                    {filteredCandidates.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSelectCandidate(c);
                          setCmdOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-high text-left cursor-pointer"
                      >
                        <div>
                          <span className="text-sm font-medium text-on-surface">{c.name}</span>
                          <span className="text-xs text-outline ml-2">{c.role}</span>
                        </div>
                        <span className="font-mono-code text-xs text-tertiary">{c.matchScore}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredJobs.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 font-label-sm text-outline uppercase tracking-wider">
                    Active Jobs
                  </div>
                  <div className="space-y-1">
                    {filteredJobs.slice(0, 3).map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => {
                          setSelectedJobId(j.id);
                          onNavigate('job-details');
                          setCmdOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-high text-left cursor-pointer"
                      >
                        <span className="text-sm font-medium text-on-surface">{j.title}</span>
                        <span className="font-mono-code text-xs text-on-surface-variant">
                          {j.location}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
