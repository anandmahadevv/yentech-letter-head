import React, { useState } from 'react';
import { Organization } from '../types';
import {
  Settings,
  ChevronDown,
  FileDown,
  Printer,
  FileCode,
  Image,
  Check,
  Building,
  GraduationCap,
  Cloud,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  organizations: Organization[];
  activeOrg: Organization;
  onSelectOrg: (org: Organization) => void;
  onOpenAdmin: () => void;
  onExportPdf: () => void;
  onExportPng: () => void;
  onExportDocx: () => void;
  onPrint: () => void;
  isExportingPdf: boolean;
  onLock?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  organizations,
  activeOrg,
  onSelectOrg,
  onOpenAdmin,
  onExportPdf,
  onExportPng,
  onExportDocx,
  onPrint,
  isExportingPdf,
  onLock,
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isChannelMenuOpen, setIsChannelMenuOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-50 bg-[#14171c] border-b border-[#232730] px-4 lg:px-6 py-2.5 flex items-center justify-between text-white select-none">
      {/* Left: YenTech Community Brandmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="px-2 py-1 bg-white rounded-md shadow-sm border border-slate-300/40 flex items-center justify-center">
              <img
                src="/yentech_cropped_logo.png"
                alt="YenTech Logo"
                className="h-5 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-mono font-black tracking-tight text-white uppercase leading-none">
                YenTech
              </span>
              <span className="text-[8.5px] font-mono font-bold text-teal-400 tracking-wider uppercase">
                Student Community
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 border-l border-slate-700 pl-2.5 hidden md:inline">
            Official Letterhead Generator
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Template Badge or Switcher */}
        {organizations.length > 1 ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsChannelMenuOpen(!isChannelMenuOpen)}
              className="px-3 py-1.5 bg-[#1e222b] hover:bg-[#282d38] border border-[#2e3442] text-xs font-medium rounded text-slate-200 flex items-center gap-2 transition cursor-pointer"
            >
              <span className="text-slate-400">Template:</span>
              <span className="font-bold text-white max-w-[140px] truncate">
                {activeOrg.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isChannelMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-[#1e222b] border border-[#2e3442] rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Select Template
                </div>
                {organizations.map((org) => {
                  const isSelected = org.id === activeOrg.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        onSelectOrg(org);
                        setIsChannelMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-500/15 text-teal-300 font-bold'
                          : 'text-slate-300 hover:bg-[#282d38] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building className="w-3.5 h-3.5 text-teal-400" />
                        <span className="truncate">{org.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 py-1.5 bg-[#1e222b] border border-[#2e3442] text-xs font-semibold rounded text-teal-300 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-teal-400" />
            <span>Official Letterhead</span>
          </div>
        )}

        {/* Export Dropdown Button (Exact White High-Contrast Button from Screenshot) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            disabled={isExportingPdf}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded flex items-center gap-1.5 transition shadow cursor-pointer disabled:opacity-50"
          >
            <span>{isExportingPdf ? 'Exporting...' : 'Export'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-[#1e222b] border border-[#2e3442] rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onExportPdf();
                  setIsExportMenuOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-[#282d38] hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-teal-400" />
                <span>Download PDF (Direct A4)</span>
              </button>

              <button
                onClick={() => {
                  onExportPng();
                  setIsExportMenuOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-[#282d38] hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Image className="w-4 h-4 text-amber-400" />
                <span>Download Image (.PNG)</span>
              </button>

              <button
                onClick={() => {
                  onExportDocx();
                  setIsExportMenuOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-[#282d38] hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-blue-400" />
                <span>Download Word (.DOCX)</span>
              </button>

              <button
                onClick={() => {
                  onPrint();
                  setIsExportMenuOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-[#282d38] hover:text-white flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Direct Print</span>
              </button>
            </div>
          )}
        </div>

        {/* Lock Studio Button */}
        {onLock && (
          <button
            type="button"
            onClick={onLock}
            title="Lock Studio"
            className="w-8 h-8 bg-[#1e222b] hover:bg-[#282d38] border border-[#2e3442] text-slate-300 hover:text-white rounded flex items-center justify-center transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Settings Gear Button in Signature AWS Orange */}
        <button
          type="button"
          onClick={onOpenAdmin}
          title="Admin Settings & Template Master Upload"
          className="w-8 h-8 bg-[#ff9900] hover:bg-[#ffad33] text-slate-950 font-bold rounded flex items-center justify-center transition shadow-md cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
