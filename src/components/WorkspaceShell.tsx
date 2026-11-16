import React, { useState, useEffect } from 'react';
import { WorkspaceRoute, CANDIDATES_DATA, JOBS_DATA } from '../data/atsData';
import { BrandLogo } from './BrandLogo';

interface WorkspaceShellProps {
  activeRoute: WorkspaceRoute;
  onNavigate: (route: WorkspaceRoute) => void;
  onGoLanding: () => void;
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
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);
  const [activeOrg, setActiveOrg] = useState('Acme Corp (Pro Plan)');

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
    [...WORKSPACE_NAV, ...BOTTOM_NAV].find((n) => n.id === activeRoute)?.label ?? 'Workspace';

  const filteredCandidates = CANDIDATES_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(cmdQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(cmdQuery.toLowerCase()))
  );

  const filteredJobs = JOBS_DATA.filter((j) =>
    j.title.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  const renderSidebarContent = () => (
    <>
      <div className="flex flex-col">
        <div
          onClick={onGoLanding}
          className="h-16 px-space-xl flex items-center gap-space-md border-b border-outline-variant/20 bg-surface-container-lowest/40 cursor-pointer hover:bg-surface-container-lowest/70 transition-colors"
          title="Back to HireSwift AI Landing Page"
        >
          <BrandLogo className="h-8 w-8 shrink-0" />
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">
              HireSwift AI
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mt-0.5">
              AI Recruitment
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-space-md">
          <div className="px-space-md py-1 font-label-sm text-label-sm text-outline uppercase tracking-wider">
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
                className={`w-full flex items-center gap-space-md px-space-md py-2 rounded-lg transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-space-md border-t border-outline-variant/20 bg-surface-container-lowest/30 flex flex-col gap-1">
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
                className={`w-full flex items-center gap-space-md px-space-md py-2 rounded-lg transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold rounded-lg'
                    : 'font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center justify-between px-space-md py-2 mt-1">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">dark_mode</span>
            <span>Theme</span>
          </div>
          <div className="flex items-center bg-surface-container-high rounded-full p-0.5 border border-outline-variant/30">
            <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-mono-code text-[10px]">
              Dark
            </span>
          </div>
        </div>

        <div className="mt-2 px-space-md py-1.5 rounded-lg bg-surface-container/60 border border-outline-variant/20 flex items-center justify-between">
          <span className="font-mono-code text-[10px] text-tertiary">v2.4 Pro • AI Enabled</span>
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[250px] bg-surface-container-low border-r border-outline-variant/30 z-40 flex-col justify-between overflow-y-auto">
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
        <header className="fixed top-0 left-0 lg:left-[250px] right-0 h-16 bg-surface-dim/90 backdrop-blur-xl border-b border-outline-variant/30 z-30 px-4 lg:px-gutter-desktop flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 lg:gap-space-lg min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
              aria-label="Open navigation menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <button
              type="button"
              onClick={onGoLanding}
              className="flex items-center gap-2 cursor-pointer shrink-0"
              title="View Landing Page"
            >
              <BrandLogo className="h-7 w-7" />
            </button>
            <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant truncate">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="text-on-surface font-medium hover:text-primary transition-colors cursor-pointer"
              >
                HireSwift
              </button>
              <span className="text-outline">/</span>
              <span className="text-tertiary font-medium truncate">{currentNavLabel}</span>
            </div>
          </div>

          {/* Search Command Bar */}
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="hidden md:flex items-center w-80 lg:w-96 px-space-md py-1.5 bg-surface-container-low rounded-lg border border-outline-variant/30 text-on-surface-variant hover:border-primary-container transition-all cursor-pointer text-left"
          >
            <span className="material-symbols-outlined text-[18px] text-outline mr-2">search</span>
            <span className="font-body-sm text-body-sm text-outline flex-1 truncate">
              Search candidates, jobs, skills...
            </span>
            <kbd className="font-mono-code text-[11px] px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/40 text-on-surface-variant">
              ⌘K
            </kbd>
          </button>

          {/* Header Right Controls */}
          <div className="flex items-center gap-2 sm:gap-space-md shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('resume-upload')}
              className="flex items-center gap-space-xs px-3 py-1.5 bg-primary-container text-on-primary-container rounded-lg font-label-md text-label-md font-medium hover:bg-secondary-container transition-colors shadow-sm cursor-pointer whitespace-nowrap"
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
                className="relative flex items-center justify-center p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-dim" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface-container border border-outline-variant/40 shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
                    <span className="font-headline-sm text-on-surface">Notifications</span>
                    <span className="font-mono-code text-[10px] text-tertiary">3 UNREAD</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-surface-container-low">
                      <p className="text-on-surface font-medium">Rahul Sharma scored 92% match</p>
                      <span className="text-outline font-mono-code text-[10px]">10m ago · Senior Python Dev</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low">
                      <p className="text-on-surface font-medium">Duplicate flagged: Sneha_Reddy_Analyst.pdf</p>
                      <span className="text-amber-300 font-mono-code text-[10px]">98.4% similarity</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low">
                      <p className="text-on-surface font-medium">Priya Verma interview confirmed</p>
                      <span className="text-outline font-mono-code text-[10px]">2h ago · Technical Round 1</span>
                    </div>
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
                className="flex items-center gap-space-xs px-2 py-1 rounded-lg bg-surface-container-low border border-outline-variant/20 cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">business</span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium hidden sm:inline whitespace-nowrap">
                  {activeOrg}
                </span>
                <span className="material-symbols-outlined text-[16px] text-outline">arrow_drop_down</span>
              </button>

              {orgOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container border border-outline-variant/40 shadow-2xl p-1.5 z-50">
                  {['Acme Corp (Pro Plan)', 'SynapticLabs (Scale)', 'NodeCraft Talent'].map((org) => (
                    <button
                      key={org}
                      type="button"
                      onClick={() => {
                        setActiveOrg(org);
                        setOrgOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        activeOrg === org
                          ? 'bg-primary-container text-on-primary-container'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      {org}
                    </button>
                  ))}
                  <div className="my-1 border-t border-outline-variant/20" />
                  <button
                    type="button"
                    onClick={onGoLanding}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-tertiary hover:bg-surface-container-high transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[15px]">public</span>
                    <span>View Marketing Site</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              title="Recruiter Account Settings"
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="relative pt-16 bg-background min-h-screen p-4 sm:p-6 lg:p-margin-desktop">
          <div className="pt-4">{children}</div>
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
                          onNavigate('candidates');
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
                          onNavigate('job-management');
                          setCmdOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-high text-left cursor-pointer"
                      >
                        <span className="text-sm font-medium text-on-surface">{j.title}</span>
                        <span className="font-mono-code text-xs text-on-surface-variant">
                          {j.applicants} applicants
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
