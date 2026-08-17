export type OrganizationId = 'technical-club' | 'mtech-committee' | string;

export interface Margins {
  top: number; // in mm, space reserved for header
  bottom: number; // in mm, space reserved for footer
  left: number; // in mm, left margin
  right: number; // in mm, right margin
}

export interface ImageAssets {
  letterheadUrl?: string; // Custom uploaded letterhead background
  letterheadOpacity: number; // 0.2 - 1.0
  logoUrl?: string; // Custom club/institute logo
  logoSize: number; // in px, e.g. 64
  signatureUrl?: string; // Signatory digital signature image
  signatureWidth: number; // in px, e.g. 140
  stampUrl?: string; // Official round stamp / seal image
  stampOpacity: number; // e.g. 0.85
  stampRotation: number; // in degrees, e.g. -10
  stampSize: number; // in px, e.g. 90
  showStamp: boolean;
  showSignature: boolean;
}

export interface Organization {
  id: OrganizationId;
  name: string;
  shortName: string;
  tagline: string;
  parentInstitution: string;
  affiliationText: string;
  refCodePrefix: string;
  themeColor: string;
  accentColor: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  campusAddress: string;
  defaultSignatoryName: string;
  defaultDesignation: string;
  defaultSignatoryDept: string;
  letterheadType: 'built-in' | 'custom-image';
  customLetterheadUrl?: string;
  margins: Margins;
  sealText?: string;
  images?: Partial<ImageAssets>;
}

export interface RecipientInfo {
  title: string;
  department: string;
  institution: string;
  location: string;
}

export interface SignatoryInfo {
  closing: string;
  name: string;
  designation: string;
  organization: string;
  contactDetails?: string;
}

export interface LetterData {
  id: string;
  orgId: OrganizationId;
  letterType: string;
  refNumber: string;
  date: string;
  recipient: RecipientInfo;
  subject: string;
  salutation: string;
  bodyParagraphs: string[];
  keyDetailsTable?: {
    headers: string[];
    rows: string[][];
  };
  callToAction: string;
  signatory: SignatoryInfo;
  copiesTo: string[];
  enclosures: string[];
  fontFamily: 'Inter' | 'Merriweather' | 'Cormorant Garamond' | 'Plus Jakarta Sans' | 'Cinzel';
  fontSizePt: number;
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  textAlign: 'left' | 'justify';
  images: ImageAssets;
}

export interface LetterTypePreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  defaultSubject: string;
  defaultRecipientTitle: string;
  defaultRecipientDept: string;
  defaultRecipientInst: string;
  sampleContextPrompt: string;
  quickTags: string[];
}

export interface GeneratedDocumentLog {
  id: string;
  orgId: string;
  orgName: string;
  letterType: string;
  subject: string;
  recipient: string;
  date: string;
  refNumber: string;
  letterData: LetterData;
  createdAt: string;
}

export interface AdminSettings {
  passcode: string;
  geminiApiKey: string;
  allowAiStreaming: boolean;
  saveLetterHistory: boolean;
  watermarkDraft: boolean;
}
