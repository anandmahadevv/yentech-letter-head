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
        ['Proposed Activity', 'Hands-on Technical Workshop & Lab Session'],
        ['Target Audience', 'Students across Engineering & Technology Departments'],
        ['Venue Requisition', 'Computing Center / Central Seminar Hall'],
        ['Required Amenities', 'High-speed Internet, AV Projector & Audio Setup'],
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
        ['Merit Prizes & Trophies', 'Awards & certificates for student finalists', '₹ 25,000'],
        ['Participant Refreshments', 'High-tea & lunch arrangements for participants', '₹ 7,000'],
        ['Total Estimated Grant', 'Complete requisition amount for the event', '₹ 40,000'],
      ],
    };

    callToAction = 'We respectfully request you to review the itemized budget proposal and accord formal financial sanction to facilitate timely vendor coordination and prize disbursements.';
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
    fontFamily: 'Plus Jakarta Sans',
    fontSizePt: 11,
    lineSpacing: 'normal',
    textAlign: 'left',
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
You are an expert institutional registrar and official correspondence officer.
Write a formal, highly articulate, polite academic letter for:
Organization: "${params.org.name}" (${params.org.parentInstitution})
Letter Type: "${params.letterTypeName}"
Subject Given: "${params.subject}"
Context Provided: "${params.context}"

CRITICAL INSTRUCTIONS:
1. Ensure the text fits on 1 single A4 page cleanly.
2. Return JSON object with subject, salutation, bodyParagraphs array, optional keyDetailsTable, callToAction.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      id: 'doc_' + Date.now(),
      orgId: params.org.id,
      letterType: params.letterTypeId,
      refNumber: generateReferenceNumber(params.org.refCodePrefix),
      date: params.dateStr || getFormattedDate(),
      recipient: params.recipient,
      subject: parsed.subject || params.subject,
      salutation: parsed.salutation || 'Respected Sir/Madam,',
      bodyParagraphs: Array.isArray(parsed.bodyParagraphs) ? parsed.bodyParagraphs : [params.context],
      keyDetailsTable: parsed.keyDetailsTable?.headers?.length ? parsed.keyDetailsTable : undefined,
      callToAction: parsed.callToAction || 'We kindly request your favorable approval.',
      signatory: {
        closing: 'Yours faithfully,',
        name: params.signatoryName || params.org.defaultSignatoryName,
        designation: params.signatoryDesignation || params.org.defaultDesignation,
        organization: params.org.name,
        contactDetails: `${params.org.contactEmail} | ${params.org.contactPhone}`,
      },
      copiesTo: Array.isArray(parsed.copiesTo) ? parsed.copiesTo : [],
      enclosures: Array.isArray(parsed.enclosures) ? parsed.enclosures : [],
      fontFamily: 'Plus Jakarta Sans',
      fontSizePt: 11,
      lineSpacing: 'normal',
      textAlign: 'left',
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
    };
  } catch (error) {
    console.warn('Gemini API call failed, using local smart generator:', error);
    return generateSmartLocalLetter(params);
  }
}

/**
 * Intelligent Text Condenser to Fit Single Page A4
 */
export async function condenseParagraphsToFit(
  paragraphs: string[],
  apiKey?: string
): Promise<string[]> {
  const fullText = paragraphs.join('\n\n');
  if (!fullText.trim()) return paragraphs;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
Condense the following official letter paragraphs so they are ~25-30% shorter to fit comfortably on 1 standard A4 letterhead page.
Preserve all crucial facts, dates, venues, quantities, and respectful tone. Return ONLY the condensed paragraphs separated by blank lines.

Text to condense:
${fullText}
`;
      const res = await model.generateContent(prompt);
      const output = res.response.text().trim();
      const condensed = output.split('\n\n').filter((p) => p.trim() !== '');
      if (condensed.length > 0) return condensed;
    } catch (e) {
      console.warn('AI condensation failed, using local sentence compression', e);
    }
  }

  // Local rule-based condensation
  return paragraphs.map((p) => {
    return p
      .replace(/We are pleased to bring to your kind notice that/gi, 'We wish to inform you that')
      .replace(/We have the honor to submit this official communication on behalf of/gi, 'On behalf of')
      .replace(/In light of the educational and skill-development value of this initiative,/gi, 'Given the educational value,')
      .replace(/All participating students and organizers will maintain utmost discipline and ensure that academic schedules remain undisturbed\./gi, 'Academic schedules and campus discipline will be strictly maintained.')
      .replace(/seeking institutional sanction and financial allocation for upcoming flagship academic and student innovation endeavors\./gi, 'requesting sanction and allocation for upcoming student academic initiatives.')
      .replace(/We respectfully request you to review the itemized budget proposal and accord formal financial sanction to facilitate timely vendor coordination and prize disbursements\./gi, 'We request your review and financial sanction to facilitate timely arrangements.')
      .trim();
  });
}
