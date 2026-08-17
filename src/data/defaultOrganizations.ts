import { Organization } from '../types';

export const DEFAULT_ORGANIZATIONS: Organization[] = [
  {
    id: 'yentech-community',
    name: 'YenTech Community',
    shortName: 'YENTECH',
    tagline: 'Student Technology & Developer Ecosystem at YSET',
    parentInstitution: 'YENEPOYA INSTITUTE OF TECHNOLOGY (YSET)',
    affiliationText: 'Yenepoya (Deemed to be University)',
    refCodePrefix: 'YTC/OFF/2026/',
    themeColor: '#179091', // Yentech Teal
    accentColor: '#179091',
    contactEmail: 'yentech.yset@gmail.com',
    contactPhone: '',
    website: 'yentech.yset@gmail.com',
    campusAddress: '',
    defaultSignatoryName: 'Anand M.',
    defaultDesignation: 'Founder & Community Lead',
    defaultSignatoryDept: 'YenTech Executive Council',
    letterheadType: 'built-in',
    margins: {
      top: 45,
      bottom: 24,
      left: 24,
      right: 24,
    },
    sealText: 'OFFICIAL SEAL • YENTECH COMMUNITY',
    images: {
      logoUrl: '/yentech_cropped_logo.png',
      logoSize: 64,
      signatureWidth: 140,
      stampOpacity: 0.85,
      stampRotation: -8,
      stampSize: 85,
      showStamp: false,
      showSignature: false,
      letterheadOpacity: 1,
    },
  },
];

export const INITIAL_ADMIN_SETTINGS = {
  passcode: 'yentech@yset2026',
  geminiApiKey: '',
  allowAiStreaming: true,
  saveLetterHistory: true,
  watermarkDraft: false,
};
