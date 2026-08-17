import { GoogleGenerativeAI } from '@google/generative-ai';
import { LetterData, Organization, RecipientInfo } from '../types';

export interface GenerateLetterParams {
  org: Organization;
  letterTypeId: string;
  letterTypeName: string;
  recipient: RecipientInfo;
  subject: string;
  context: string;
  dateStr: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  geminiApiKey?: string;
}

/**
 * Format current date in standard formal academic style: "August 17, 2026"
 */
export function getFormattedDate(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate unique official reference code: e.g. TC/OFF/2026/084
 */
export function generateReferenceNumber(prefix: string): string {
  const randomId = Math.floor(100 + Math.random() * 900);
  const monthRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][new Date().getMonth()];
  return `${prefix}${monthRoman}/${randomId}`;
}

/**
 * Smart Local AI Generator (Rule-based & Context-aware)
 */
export function generateSmartLocalLetter(params: GenerateLetterParams): LetterData {
  const { org, letterTypeId, recipient, context, dateStr, signatoryName, signatoryDesignation } = params;

  const refNumber = generateReferenceNumber(org.refCodePrefix);
  const activeSignatoryName = signatoryName || org.defaultSignatoryName;
  const activeDesignation = signatoryDesignation || org.defaultDesignation;

  let paragraphs: string[] = [];
  let table: { headers: string[]; rows: string[][] } | undefined = undefined;
  let callToAction = 'We kindly request you to grant the necessary permission and approvals for the aforementioned request. We assure you of strict adherence to all institutional guidelines and regulations.';
  let copiesTo = [
    `The Dean (Student Affairs & Campus Activities), ${org.parentInstitution}`,
    `The Faculty Advisor, ${org.name}`,
    `Office of Academic Administration & Records`,
  ];
  let enclosures = [
    'Detailed Event Concept Note & Schedule',
    'Faculty Mentor Endorsement Letter',
    'List of Organizing Committee Members & Student Participants',
  ];

  // Specific contextual parsing based on template type and context text
  if (letterTypeId === 'permission-workshop' || context.toLowerCase().includes('workshop') || context.toLowerCase().includes('hackathon')) {
    paragraphs = [
      `On behalf of the ${org.name}, ${org.parentInstitution}, we are pleased to bring to your kind notice that our committee has planned an impactful technical initiative aimed at upskilling student members in cutting-edge computing disciplines.`,
      context.trim() || `We propose to organize a comprehensive hands-on technical workshop on emerging technology domains for interested undergraduate and postgraduate students. The session will cover industry-standard frameworks, architectural paradigms, and practical lab assignments led by certified mentors.`,
      `To ensure the smooth and effective execution of this program, we require the requisite infrastructure and logistical allocation as summarized below. All participating students and organizers will maintain utmost discipline and ensure that academic schedules remain undisturbed.`,
    ];

    table = {
      headers: ['Parameter / Item', 'Specifications & Details'],
      rows: [
        ['Proposed Activity', 'Hands-on Technical Workshop & Hands-on Lab'],
        ['Target Audience', 'Students across CSE / IT / ECE & PG Programs'],
        ['Venue Requisition', 'Computing Lab 3 / Central Seminar Hall'],
        ['Required Amenities', 'High-speed LAN/Wi-Fi, AV Projector & Audio Setup'],
      ],
    };

    callToAction = 'In light of the educational and skill-development value of this initiative, we humbly request you to grant formal permission to utilize the campus facilities and sanction the conduct of the event.';
  } else if (letterTypeId === 'budget-sponsorship' || context.toLowerCase().includes('budget') || context.toLowerCase().includes('inr') || context.toLowerCase().includes('grant')) {
    paragraphs = [
      `We submit this formal requisition on behalf of the ${org.name} seeking institutional sanction and financial allocation for upcoming flagship academic and student innovation endeavors.`,
      context.trim() || `The student executive committee has finalized the logistical planning for our annual technical symposium. To host guest luminaries, procure event kits, and award meritorious student finalists, a modest financial outlay is essential.`,
      `The projected expense breakdown has been thoroughly vetted by our student coordinators and faculty mentor to ensure optimal resource utilization and strict compliance with institutional auditing procedures.`,
    ];

    table = {
      headers: ['Expenditure Category', 'Description', 'Allocated (INR)'],
      rows: [
        ['Keynote Speaker Honorarium', 'Travel & Hospitality for Guest Dignitaries', '₹ 8,000'],
        ['Merit Prizes & Trophies', 'Cash awards & shields for 1st, 2nd & 3rd place', '₹ 25,000'],
        ['Participant Refreshments', 'High-tea & lunch arrangements for participants', '₹ 7,000'],
        ['Stationery & Event Kits', 'Badges, certificates, banners & documentation', '₹ 5,000'],
        ['Total Estimated Grant', 'Complete requisition amount for the event', '₹ 45,000'],
      ],
    };

    callToAction = 'We respectfully request you to review the itemized budget proposal and accord formal financial sanction to facilitate timely vendor coordination and prize disbursements.';
  } else if (letterTypeId === 'guest-invitation' || context.toLowerCase().includes('invitation') || context.toLowerCase().includes('guest')) {
    paragraphs = [
      `It is our distinct privilege and honor to reach out to you on behalf of the ${org.name}, ${org.parentInstitution}. Our institution has been at the forefront of technical excellence, research, and holistic student development.`,
      context.trim() || `We take immense pleasure in cordially inviting you as our Esteemed Chief Guest & Keynote Speaker for our forthcoming National Technical Conclave. Your pioneering contributions and distinguished industry leadership would serve as a profound inspiration to our student innovators and faculty scholars.`,
      `The convention will witness an audience of over 500 aspiring engineers, researchers, and tech enthusiasts eager to gain insights from your distinguished professional journey. Our committee shall gladly undertake all arrangements pertaining to your local reception, hospitality, and scheduling convenience.`,
    ];

    table = {
      headers: ['Session Component', 'Proposed Schedule & Details'],
      rows: [
        ['Event Title', 'National Technical Conclave & Innovation Summit 2026'],
        ['Format & Role', 'Keynote Address (30 Mins) followed by Q&A (15 Mins)'],
        ['Audience Profile', 'B.Tech, M.Tech Scholars & Department Faculty Members'],
        ['Hospitality & Travel', 'Coordinated directly by our Executive Liaison Team'],
      ],
    };

    callToAction = 'We earnestly hope that your schedule permits you to grace this momentous occasion. We kindly request you to communicate your gracious acceptance at your earliest convenience.';
  } else if (letterTypeId === 'duty-leave' || context.toLowerCase().includes('duty leave') || context.toLowerCase().includes('attendance')) {
    paragraphs = [
      `We respectfully submit this representation on behalf of the ${org.name} regarding the grant of On-Duty (OD) attendance credit for our designated student organizers and competitive delegates.`,
      context.trim() || `The student members listed in the enclosure have been entrusted with critical organizational duties, system infrastructure setup, and representation of our institute in major national-level hackathons and technical symposiums.`,
      `As these responsibilities required full-time on-site deployment during academic hours, we request that their absence from regular class sessions and laboratory practicals be condoned with official OD attendance credit in the university attendance portal.`,
    ];

    enclosures = [
      'Nominal Roll of Student Organizers with Roll Numbers & Semesters',
      'Duty Allocation Roster & Event Proof of Participation',
      'Faculty Advisor Verification Certificate',
    ];

    callToAction = 'We kindly request your good office to issue necessary directives to the respective subject faculty members and the academic attendance cell to record the On-Duty status for the specified dates.';
  } else {
    // General Formal Letter
    paragraphs = [
      `We have the honor to submit this official communication on behalf of the ${org.name}, ${org.parentInstitution}.`,
      context.trim() || `This representation is placed before your kind authority to apprise you of upcoming student development initiatives and seek administrative concurrence for the planned schedule of activities.`,
      `Our committee remains deeply committed to upholding the academic stature of the institution while fostering innovation, technical proficiency, and ethical leadership among all student members.`,
    ];

    callToAction = 'We humbly request your favorable consideration and kind approval to enable us to proceed with the planned roadmap in a systematic manner.';
  }

  return {
    id: 'doc_' + Date.now(),
    orgId: org.id,
    letterType: letterTypeId,
    refNumber,
    date: dateStr || getFormattedDate(),
    recipient: {
      title: recipient.title || 'The Head of Department',
      department: recipient.department || 'Department of Computer Science & Engineering',
      institution: recipient.institution || org.parentInstitution,
      location: recipient.location || 'Main Academic Complex',
    },
    subject: params.subject || `Official Representation Regarding ${org.name} Activities`,
    salutation: 'Respected Sir/Madam,',
    bodyParagraphs: paragraphs,
    keyDetailsTable: table,
    callToAction,
    signatory: {
      closing: 'Yours faithfully,',
      name: activeSignatoryName,
      designation: activeDesignation,
      organization: org.name,
      contactDetails: `${org.contactEmail} | ${org.contactPhone}`,
    },
    copiesTo,
    enclosures,
    fontFamily: 'Inter',
    fontSizePt: 11,
    lineSpacing: 'normal',
    textAlign: 'justify',
    images: {
      letterheadUrl: org.customLetterheadUrl,
      letterheadOpacity: 1,
      logoUrl: org.images?.logoUrl,
      logoSize: 64,
      signatureUrl: org.images?.signatureUrl,
      signatureWidth: 130,
      stampUrl: org.images?.stampUrl,
      stampOpacity: 0.85,
      stampRotation: -8,
      stampSize: 85,
      showStamp: false,
      showSignature: true,
    },
  };
}

/**
 * Gemini AI Generation using Google Generative AI SDK
 */
export async function generateGeminiAiLetter(params: GenerateLetterParams): Promise<LetterData> {
  const apiKey = params.geminiApiKey || '';
  if (!apiKey || apiKey.trim() === '') {
    return generateSmartLocalLetter(params);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert institutional registrar and official correspondence officer for prestigious engineering universities.
Write a formal, highly articulate, polite, and authoritative Indian/international academic official letter for:

Organization: "${params.org.name}" (${params.org.parentInstitution})
Letter Type: "${params.letterTypeName}"
Recipient Title: "${params.recipient.title}"
Recipient Department: "${params.recipient.department}"
Recipient Institution: "${params.recipient.institution || params.org.parentInstitution}"
Subject Given: "${params.subject}"
Context Provided by User: "${params.context}"
Signatory: "${params.signatoryName || params.org.defaultSignatoryName}", "${params.signatoryDesignation || params.org.defaultDesignation}"
Date: "${params.dateStr}"

CRITICAL FORMATTING INSTRUCTIONS:
1. The tone must be respectful, polished, formal, and precise.
2. Structure the letter into 3-4 crisp paragraphs that fit cleanly on 1 standard A4 letterhead page.
3. If the context mentions dates, schedule, numbers, participant counts, or budget, provide an organized summary table.
4. Output STRICTLY a valid JSON object with the following structure (no markdown fences, no explanatory preamble):
{
  "subject": "Refined formal subject string starting with 'Request for...' or 'Requisition for...' or 'Invitation for...'",
  "salutation": "Respected Sir/Madam,",
  "bodyParagraphs": [
    "Paragraph 1: Introduction and formal purpose...",
    "Paragraph 2: Contextual justification, dates, scale, details...",
    "Paragraph 3: Organizational assurances, faculty mentorship, discipline..."
  ],
  "keyDetailsTable": {
    "headers": ["Parameter / Header", "Details / Value"],
    "rows": [
      ["Item 1", "Value 1"],
      ["Item 2", "Value 2"]
    ]
  },
  "callToAction": "Final polite request for approval and signature...",
  "copiesTo": [
    "1. The Dean (Student Affairs), Institution Name",
    "2. The Faculty Advisor, Club Name",
    "3. Office Records"
  ],
  "enclosures": [
    "Detailed Event Schedule & Proposal",
    "List of Student Participants / Organizers"
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Clean JSON markdown fences if present
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      id: 'doc_' + Date.now(),
      orgId: params.org.id,
      letterType: params.letterTypeId,
      refNumber: generateReferenceNumber(params.org.refCodePrefix),
      date: params.dateStr || getFormattedDate(),
      recipient: {
        title: params.recipient.title,
        department: params.recipient.department,
        institution: params.recipient.institution || params.org.parentInstitution,
        location: params.recipient.location || 'Main Academic Block',
      },
      subject: parsed.subject || params.subject,
      salutation: parsed.salutation || 'Respected Sir/Madam,',
      bodyParagraphs: Array.isArray(parsed.bodyParagraphs) ? parsed.bodyParagraphs : [params.context],
      keyDetailsTable: parsed.keyDetailsTable?.headers?.length ? parsed.keyDetailsTable : undefined,
      callToAction: parsed.callToAction || 'We kindly request your favorable approval and guidance.',
      signatory: {
        closing: 'Yours faithfully,',
        name: params.signatoryName || params.org.defaultSignatoryName,
        designation: params.signatoryDesignation || params.org.defaultDesignation,
        organization: params.org.name,
        contactDetails: `${params.org.contactEmail} | ${params.org.contactPhone}`,
      },
      copiesTo: Array.isArray(parsed.copiesTo) ? parsed.copiesTo : [],
      enclosures: Array.isArray(parsed.enclosures) ? parsed.enclosures : [],
      fontFamily: 'Inter',
      fontSizePt: 11,
      lineSpacing: 'normal',
      textAlign: 'justify',
      images: {
        letterheadUrl: params.org.customLetterheadUrl,
        letterheadOpacity: 1,
        logoUrl: params.org.images?.logoUrl,
        logoSize: 64,
        signatureUrl: params.org.images?.signatureUrl,
        signatureWidth: 130,
        stampUrl: params.org.images?.stampUrl,
        stampOpacity: 0.85,
        stampRotation: -8,
        stampSize: 85,
        showStamp: false,
        showSignature: true,
      },
    };
  } catch (error) {
    console.warn('Gemini API call failed or timed out. Falling back to high-accuracy local smart generator:', error);
    return generateSmartLocalLetter(params);
  }
}
