/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { CandidateDrawer } from './components/CandidateDrawer';
import { LandingPage } from './components/LandingPage';
import { WorkspaceShell } from './components/WorkspaceShell';
import { CandidatesView } from './components/views/CandidatesView';
import { DashboardView } from './components/views/DashboardView';
import {
  EmailCenterView,
  HelpCenterView,
  ReportsView,
  SettingsView,
  SkillGapAnalysisView,
} from './components/views/OperationsViews';
import { ResumeUploadView } from './components/views/ResumeUploadView';
import {
  AIMatchingView,
  CandidateRankingView,
  CompareCandidatesView,
  HiringPipelineView,
  JobManagementView,
} from './components/views/TalentWorkflowViews';
import { CandidateProfile, WorkspaceRoute } from './data/atsData';

const VALID_ROUTES: WorkspaceRoute[] = [
  'dashboard',
  'candidates',
  'resume-upload',
  'job-management',
  'ai-matching',
  'candidate-ranking',
  'hiring-pipeline',
  'compare-candidates',
  'skill-gap-analysis',
  'email-center',
  'reports',
  'settings',
  'help-center',
];

function parseHashState(): { mode: 'landing' | 'workspace'; route: WorkspaceRoute } {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (VALID_ROUTES.includes(hash as WorkspaceRoute)) {
    return { mode: 'workspace', route: hash as WorkspaceRoute };
  }
  return { mode: 'landing', route: 'dashboard' };
}

export default function App() {
  const initial = parseHashState();
  const [mode, setMode] = useState<'landing' | 'workspace'>(initial.mode);
  const [activeRoute, setActiveRoute] = useState<WorkspaceRoute>(initial.route);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const next = parseHashState();
      setMode(next.mode);
      setActiveRoute(next.route);
      setSelectedCandidate(null);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const enterWorkspace = (route: WorkspaceRoute = 'dashboard') => {
    setActiveRoute(route);
    setMode('workspace');
    setSelectedCandidate(null);
    window.location.hash = `/${route}`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const navigateWorkspace = (route: WorkspaceRoute) => {
    setActiveRoute(route);
    setSelectedCandidate(null);
    window.location.hash = `/${route}`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const goLanding = () => {
    setMode('landing');
    setSelectedCandidate(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  if (mode === 'landing') {
    return <LandingPage onEnterWorkspace={enterWorkspace} />;
  }

  const renderWorkspaceView = () => {
    switch (activeRoute) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={navigateWorkspace}
            onSelectCandidate={setSelectedCandidate}
          />
        );
      case 'candidates':
        return (
          <CandidatesView
            onNavigate={navigateWorkspace}
            onSelectCandidate={setSelectedCandidate}
          />
        );
      case 'resume-upload':
        return (
          <ResumeUploadView
            onNavigate={navigateWorkspace}
            onSelectCandidate={setSelectedCandidate}
          />
        );
      case 'job-management':
        return <JobManagementView onNavigate={navigateWorkspace} />;
      case 'ai-matching':
        return (
          <AIMatchingView
            onNavigate={navigateWorkspace}
            onSelectCandidate={setSelectedCandidate}
          />
        );
      case 'candidate-ranking':
        return (
          <CandidateRankingView
            onNavigate={navigateWorkspace}
            onSelectCandidate={setSelectedCandidate}
          />
        );
      case 'hiring-pipeline':
        return (
          <HiringPipelineView
            onNavigate={navigateWorkspace}
            onSelectCandidate={setSelectedCandidate}
          />
        );
      case 'compare-candidates':
        return (
          <CompareCandidatesView
            onNavigate={navigateWorkspace}
            onSelectCandidate={setSelectedCandidate}
          />
        );
      case 'skill-gap-analysis':
        return <SkillGapAnalysisView />;
      case 'email-center':
        return <EmailCenterView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'help-center':
        return <HelpCenterView onNavigate={navigateWorkspace} />;
      default:
        return (
          <DashboardView
            onNavigate={navigateWorkspace}
            onSelectCandidate={setSelectedCandidate}
          />
        );
    }
  };

  return (
    <>
      <WorkspaceShell
        activeRoute={activeRoute}
        onNavigate={navigateWorkspace}
        onGoLanding={goLanding}
      >
        {renderWorkspaceView()}
      </WorkspaceShell>

      <CandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onScheduleEmail={() => navigateWorkspace('email-center')}
      />
    </>
  );
}
