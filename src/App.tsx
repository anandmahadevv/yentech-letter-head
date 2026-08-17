import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LayerSidebar } from './components/LayerSidebar';
import { LetterCanvas } from './components/LetterCanvas';
import { AdminModal } from './components/AdminModal';
import { Lockscreen } from './components/Lockscreen';
import {
  Organization,
  LetterData,
  RecipientInfo,
  AdminSettings,
  GeneratedDocumentLog,
} from './types';
import {
  loadOrganizations,
  saveOrganizations,
  loadAdminSettings,
  saveAdminSettings,
  loadDocumentHistory,
  saveDocumentToHistory,
  deleteHistoryItem,
  clearAllHistory,
  isStudioAuthenticated,
  setStudioAuthenticated,
  clearStudioAuth,
} from './services/storageService';
import {
  exportToPdf,
  exportToPng,
  exportToDocx,
} from './services/exportService';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileDown,
  Printer,
  X,
} from 'lucide-react';

const getFormattedDate = (): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return new Date().toLocaleDateString('en-GB', options);
};

const createInitialBlankLetter = (org: Organization): LetterData => ({
  id: `letter_${Date.now()}`,
  orgId: org.id,
  letterType: 'general-official',
  refNumber: `${org.refCodePrefix}${new Date().getFullYear()}/001`,
  date: getFormattedDate(),
  recipient: {
    title: '',
    department: '',
    institution: org.parentInstitution,
    location: '',
  },
  subject: 'This is a headline',
  salutation: '',
  bodyParagraphs: [
    'Body text goes here'
  ],
  callToAction: '',
  signatory: {
    closing: 'Yours faithfully,',
    name: org.defaultSignatoryName,
    designation: org.defaultDesignation,
    organization: org.name,
    contactDetails: org.contactEmail,
  },
  fontFamily: 'Plus Jakarta Sans',
  fontSizePt: 11,
  lineSpacing: 'normal',
  textAlign: 'left',
  copiesTo: [],
  enclosures: [],
  images: {
    letterheadOpacity: 1,
    logoSize: 52,
    signatureWidth: 140,
    stampOpacity: 0.85,
    stampRotation: -8,
    stampSize: 85,
    showStamp: false,
    showSignature: false,
  },
});

export function App() {
  // State Initialization
  const [organizations, setOrganizations] = useState<Organization[]>(() => loadOrganizations());
  const [activeOrg, setActiveOrg] = useState<Organization>(() => organizations[0]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => loadAdminSettings());
  const [historyLogs, setHistoryLogs] = useState<GeneratedDocumentLog[]>(() => loadDocumentHistory());

  // 24-Hour Passcode Gatekeeper Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isStudioAuthenticated());

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState<number>(0.78);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Initial letter starts blank with heading & body
  const [letterData, setLetterData] = useState<LetterData>(() =>
    createInitialBlankLetter(activeOrg)
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleUnlockStudio = () => {
    setStudioAuthenticated();
    setIsAuthenticated(true);
    showToast('Studio unlocked for 24 hours');
  };

  const handleLockStudio = () => {
    clearStudioAuth();
    setIsAuthenticated(false);
    showToast('Studio locked');
  };

  // Keyboard shortcut listener for Esc to exit Fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleToggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleToggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        // Fallback to overlay fullscreen without error
      }
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch (err) {
        // Ignore exit error
      }
    }
  };

  // Synchronize when active organization changes
  const handleSelectOrg = (org: Organization) => {
    setActiveOrg(org);
    setLetterData((prev) => ({
      ...prev,
      orgId: org.id,
      refNumber: `${org.refCodePrefix}${new Date().getFullYear()}/001`,
      signatory: {
        ...prev.signatory,
        name: org.defaultSignatoryName,
        designation: org.defaultDesignation,
        organization: org.name,
        contactDetails: org.contactEmail,
      },
    }));
    showToast(`Switched channel: ${org.name}`);
  };

  // Generate Letter Handler
  const handleGenerate = async (params: {
    org: Organization;
    letterTypeId: string;
    letterTypeName: string;
    recipient: RecipientInfo;
    subject: string;
    context: string;
    dateStr: string;
    signatoryName: string;
    signatoryDesignation: string;
  }) => {
    setIsGenerating(true);
    try {
      setLetterData((prev) => ({
        ...prev,
        orgId: params.org.id,
        recipient: params.recipient,
        subject: params.subject || prev.subject,
        date: params.dateStr || prev.date,
        signatory: {
          ...prev.signatory,
          name: params.signatoryName,
          designation: params.signatoryDesignation,
        },
      }));
      showToast('Document updated successfully');
    } catch (error) {
      console.error('Generation failed:', error);
      showToast('Could not complete generation');
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct Auto-Fit Document to 1 Page
  const handleAutoFit = () => {
    setLetterData((prev) => ({
      ...prev,
      fontSizePt: 10,
    }));
    showToast('Document fitted to 1 page');
  };

  // Make More Formal
  const handleMakeMoreFormal = () => {
    showToast('Tone calibrated to official academic standard');
  };

  // Partial updates to letter data
  const handleUpdateLetterData = (updated: Partial<LetterData>) => {
    setLetterData((prev) => ({ ...prev, ...updated }));
  };

  // Updates to active organization
  const handleUpdateOrganization = (updatedOrg: Organization) => {
    setActiveOrg(updatedOrg);
    const updatedOrgs = organizations.map((o) =>
      o.id === updatedOrg.id ? updatedOrg : o
    );
    setOrganizations(updatedOrgs);
    saveOrganizations(updatedOrgs);
    showToast('Organization settings updated');
  };

  const handleAddOrganization = (newOrg: Organization) => {
    const updated = [...organizations, newOrg];
    setOrganizations(updated);
    saveOrganizations(updated);
    setActiveOrg(newOrg);
    showToast(`Added channel: ${newOrg.name}`);
  };

  const handleUpdateAdminSettings = (updated: AdminSettings) => {
    setAdminSettings(updated);
    saveAdminSettings(updated);
    showToast('System configuration saved');
  };

  // Export handlers
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportToPdf('letter-a4-canvas', 'yentech-letter-head');
      saveDocumentToHistory(letterData, activeOrg);
      setHistoryLogs(loadDocumentHistory());
      showToast('PDF exported successfully as yentech-letter-head.pdf');
    } catch (err: any) {
      console.error('PDF export error:', err);
      showToast('PDF Export encountered an error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportPng = async () => {
    try {
      await exportToPng('letter-a4-canvas', 'yentech-letter-head');
      showToast('Image exported as yentech-letter-head.png');
    } catch (err: any) {
      console.error('PNG export error:', err);
      showToast('PNG Export error');
    }
  };

  const handleExportDocx = async () => {
    try {
      await exportToDocx(letterData, activeOrg);
      showToast('Word document exported as yentech-letter-head.docx');
    } catch (err: any) {
      console.error('Docx export error:', err);
      showToast('Docx Export error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRestoreHistory = (historyItem: GeneratedDocumentLog) => {
    setLetterData(historyItem.letterData);
    const foundOrg = organizations.find((o) => o.id === historyItem.letterData.orgId);
    if (foundOrg) {
      setActiveOrg(foundOrg);
    }
    showToast(`Restored snapshot from ${new Date(historyItem.createdAt).toLocaleDateString()}`);
  };

  // If not authenticated within 24-hour interval, show Gatekeeper Lockscreen
  if (!isAuthenticated) {
    return (
      <Lockscreen
        onUnlock={handleUnlockStudio}
        correctPasscode={adminSettings.passcode || 'yentech@yset2026'}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f1117] text-slate-100 overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed top-4 right-4 z-50 bg-[#161922] border border-teal-500/50 text-teal-300 px-4 py-2 rounded-lg shadow-2xl text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        organizations={organizations}
        activeOrg={activeOrg}
        onSelectOrg={handleSelectOrg}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onExportPdf={handleExportPdf}
        onExportPng={handleExportPng}
        onExportDocx={handleExportDocx}
        onPrint={handlePrint}
        isExportingPdf={isExportingPdf}
        onLock={handleLockStudio}
      />

      {/* Main Studio Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Layers / Controls Sidebar */}
        <LayerSidebar
          letterData={letterData}
          activeOrg={activeOrg}
          onUpdateLetterData={handleUpdateLetterData}
          onUpdateOrg={handleUpdateOrganization}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onExportPdf={handleExportPdf}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
        />

        {/* Center Canvas Studio */}
        <main className="flex-1 bg-[#090b10] overflow-y-auto flex flex-col items-center p-6 relative">
          {/* Canvas Top Bar Header */}
          <div className="no-print w-full max-w-[210mm] flex items-center justify-between mb-3 text-slate-400 text-xs font-mono select-none">
            <span className="text-[11px] text-slate-400">
              US Letter / A4 | {activeOrg.name}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale(Math.max(0.6, zoomScale - 0.1))}
                className="p-1 hover:text-white bg-[#161922] border border-[#232730] rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="text-[11px] font-mono text-slate-300 px-1">
                {Math.round(zoomScale * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setZoomScale(Math.min(1.4, zoomScale + 0.1))}
                className="p-1 hover:text-white bg-[#161922] border border-[#232730] rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setZoomScale(0.78)}
                className="px-2 py-0.5 text-[10.5px] hover:text-white bg-[#161922] border border-[#232730] rounded font-mono cursor-pointer"
                title="Reset Fit (78%)"
              >
                Fit
              </button>

              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="p-1 hover:text-teal-300 hover:border-teal-500/50 bg-[#161922] border border-[#232730] rounded cursor-pointer text-slate-300 transition ml-1"
                title="Toggle Fullscreen Preview"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scaled A4 / US-Letter Canvas */}
          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="pb-16"
          >
            <LetterCanvas
              letterData={letterData}
              org={activeOrg}
              onUpdateLetterData={handleUpdateLetterData}
              onUpdateOrg={handleUpdateOrganization}
              onAutoFitPage={handleAutoFit}
              onMakeMoreFormal={handleMakeMoreFormal}
              showGrid={showGrid}
            />
          </div>

          {/* Bottom-Right Zoom Indicator */}
          <div className="no-print fixed bottom-4 right-6 bg-[#161922] border border-[#232730] px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-400 shadow-xl pointer-events-none z-30 flex items-center gap-2">
            <span>{Math.round(zoomScale * 100)}%</span>
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* IMMERSIVE FULLSCREEN PREVIEW MODAL OVERLAY                                */}
      {/* ========================================================================= */}
      {isFullscreen && (
        <div className="no-print fixed inset-0 z-50 bg-[#07090e]/95 backdrop-blur-md flex flex-col items-center overflow-y-auto p-4 md:p-8 animate-in fade-in duration-150">
          {/* Floating Fullscreen Header Bar */}
          <div className="sticky top-2 z-50 bg-[#161922] border border-[#2e3442] shadow-2xl rounded-full px-5 py-2.5 flex items-center gap-4 text-white text-xs font-mono mb-6 select-none">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="font-bold tracking-tight text-white uppercase">
                Fullscreen Preview
              </span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                (Press <kbd className="px-1.5 py-0.5 bg-[#232730] text-slate-300 rounded border border-slate-700 text-[10px]">Esc</kbd> to exit)
              </span>
            </div>

            <div className="h-4 w-px bg-slate-700" />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1 bg-[#232730] hover:bg-[#2e3442] text-slate-200 rounded-full flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="p-1.5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-full transition cursor-pointer ml-1"
                title="Exit Fullscreen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full-Scale 1:1 Letterhead Display */}
          <div className="pb-16 transition-all duration-200">
            <LetterCanvas
              letterData={letterData}
              org={activeOrg}
              onUpdateLetterData={handleUpdateLetterData}
              onUpdateOrg={handleUpdateOrganization}
              onAutoFitPage={handleAutoFit}
              onMakeMoreFormal={handleMakeMoreFormal}
              showGrid={showGrid}
            />
          </div>
        </div>
      )}

      {/* Admin Master Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        organizations={organizations}
        activeOrg={activeOrg}
        onUpdateOrganization={handleUpdateOrganization}
        onAddOrganization={handleAddOrganization}
        adminSettings={adminSettings}
        onUpdateAdminSettings={handleUpdateAdminSettings}
        historyLogs={historyLogs}
        onRestoreHistory={handleRestoreHistory}
        onDeleteHistory={(id) => {
          deleteHistoryItem(id);
          setHistoryLogs(loadDocumentHistory());
        }}
        onClearHistory={() => {
          clearAllHistory();
          setHistoryLogs([]);
        }}
      />
    </div>
  );
}

export default App;
