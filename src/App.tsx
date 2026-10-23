import React, { useState } from 'react';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthorDashboard } from './components/AuthorDashboard';
import { ReviewerDashboard } from './components/ReviewerDashboard';
import { ApproverDashboard } from './components/ApproverDashboard';
import { RepositoryView } from './components/RepositoryView';
import { AuditTrailView } from './components/AuditTrailView';
import { ComplianceMatrixView } from './components/ComplianceMatrixView';
import { SystemGuideView } from './components/SystemGuideView';
import { AISidePanel } from './components/AISidePanel';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { AccessDeniedModal } from './components/AccessDeniedModal';
import { AddAuthorModal } from './components/AddAuthorModal';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    previewDocForPDF,
    setPreviewDocForPDF,
    complianceAlert,
    closeComplianceAlert,
    isAddAuthorModalOpen,
    setIsAddAuthorModalOpen,
  } = useWorkflow();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header */}
        <Header onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        {/* View Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {activeTab === 'author' && <AuthorDashboard />}
          {activeTab === 'reviewer' && <ReviewerDashboard />}
          {activeTab === 'approver' && <ApproverDashboard />}
          {activeTab === 'repository' && <RepositoryView />}
          {activeTab === 'audittrail' && <AuditTrailView />}
          {activeTab === 'compliance' && <ComplianceMatrixView />}
          {activeTab === 'guide' && <SystemGuideView />}
        </main>

        {/* AI Scanner Results Side Panel */}
        <AISidePanel />

        {/* PDF Document Preview Modal */}
        {previewDocForPDF && (
          <PDFPreviewModal
            document={previewDocForPDF}
            onClose={() => setPreviewDocForPDF(null)}
          />
        )}

        {/* 21 CFR Part 11 Segregation Access Denied Modal */}
        {complianceAlert && (
          <AccessDeniedModal
            isOpen={complianceAlert.isOpen}
            onClose={closeComplianceAlert}
            message={complianceAlert.message}
            attemptedAction={complianceAlert.attemptedAction}
          />
        )}

        {/* Enroll New Author Persona Modal */}
        <AddAuthorModal
          isOpen={isAddAuthorModalOpen}
          onClose={() => setIsAddAuthorModalOpen(false)}
        />
      </div>
    </div>
  );
};

export function App() {
  return (
    <WorkflowProvider>
      <MainLayout />
    </WorkflowProvider>
  );
}

export default App;
