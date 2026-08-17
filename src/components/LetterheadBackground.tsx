import React from 'react';
import { Organization } from '../types';

interface LetterheadBackgroundProps {
  org: Organization;
  showGrid?: boolean;
}

export const LetterheadBackground: React.FC<LetterheadBackgroundProps> = ({ org, showGrid = true }) => {
  // If custom uploaded image letterhead
  if (org.letterheadType === 'custom-image' && org.customLetterheadUrl) {
    return (
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none" style={{ backgroundColor: '#ffffff' }}>
        <img
          src={org.customLetterheadUrl}
          alt={`${org.name} Official Letterhead`}
          className="w-full h-full object-fill pointer-events-none"
          style={{ opacity: org.images?.letterheadOpacity ?? 1 }}
        />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none flex flex-col justify-between p-0"
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* ===================== SUBTLE GRAPH PAPER GRID ===================== */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.45]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(226, 232, 240, 0.85) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(226, 232, 240, 0.85) 1px, transparent 1px)
            `,
            backgroundSize: '34px 34px',
          }}
        />
      )}

      {/* ===================== CENTER WATERMARK ===================== */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/yentech_cropped_watermark.png"
          alt="YenTech Watermark"
          className="w-[420px] h-auto object-contain opacity-[0.05] select-none"
        />
      </div>

      {/* ===================== TOP HEADER BLOCK ===================== */}
      <div
        className="w-full relative px-10 pt-8 pb-5 flex items-center justify-between z-10"
        style={{ borderBottom: '1px solid #e2e8f0' }}
      >
        {/* Top Left: Title & Email in Poppins font (Reduced slightly) */}
        <div className="flex flex-col justify-center">
          <h2
            className="text-lg md:text-xl font-bold tracking-tight leading-tight"
            style={{
              color: '#179091', // Official Teal
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {org.name}
          </h2>
          <p
            className="text-[11px] md:text-xs font-normal tracking-normal mt-0.5"
            style={{
              color: '#545353',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            yentech.yset@gmail.com
          </p>
        </div>

        {/* Top Right: Official Yentech Logo (Calibrated to 3.2x Scale) */}
        <div className="flex items-center justify-end">
          <img
            src="/yentech_cropped_logo.png"
            alt="Yentech Logo"
            className="w-auto object-contain drop-shadow-xs"
            style={{
              height: '52px',
              maxWidth: '215px',
            }}
          />
        </div>
      </div>

      {/* ===================== BOTTOM FOOTER (ONLY TEAL BAR & EMAIL) ===================== */}
      <div className="w-full relative z-10">
        {/* Teal Accent Bar from Template */}
        <div
          className="w-full h-1"
          style={{ backgroundColor: '#179091' }}
        />

        {/* Clean Footer - ONLY email id */}
        <div
          className="w-full px-10 py-3 bg-white flex items-center justify-start text-[11px]"
          style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#545353',
          }}
        >
          <span className="font-normal tracking-wide">
            yentech.yset@gmail.com
          </span>
        </div>
      </div>
    </div>
  );
};
