export type ResearchMode = 'analyze' | 'synthesize' | 'ideate' | 'draft' | 'review' | 'chat';

export interface ModeDetectionResult {
  mode: ResearchMode;
  explicitCommand: boolean;
  cleanPrompt: string;
  draftStyle?: 'NeurIPS' | 'ICML' | 'IEEE' | 'ACM' | 'General';
}

const COMMAND_MAP: Record<string, ResearchMode> = {
  '/analyze': 'analyze',
  '/synthesize': 'synthesize',
  '/ideate': 'ideate',
  '/draft': 'draft',
  '/review': 'review',
};

export function detectResearchMode(
  input: string,
  hasMultipleDocs: boolean = false,
  hasSingleDoc: boolean = false
): ModeDetectionResult {
  const trimmed = (input || '').trim();

  // Check for explicit slash command
  const firstToken = trimmed.split(/\s+/)[0]?.toLowerCase();
  if (firstToken && COMMAND_MAP[firstToken]) {
    const mode = COMMAND_MAP[firstToken];
    const cleanPrompt = trimmed.slice(firstToken.length).trim();

    let draftStyle: ModeDetectionResult['draftStyle'];
    if (mode === 'draft') {
      const lower = cleanPrompt.toLowerCase();
      if (lower.includes('neurips')) draftStyle = 'NeurIPS';
      else if (lower.includes('icml')) draftStyle = 'ICML';
      else if (lower.includes('ieee')) draftStyle = 'IEEE';
      else if (lower.includes('acm')) draftStyle = 'ACM';
      else draftStyle = 'General';
    }

    return {
      mode,
      explicitCommand: true,
      cleanPrompt,
      draftStyle,
    };
  }

  // Infer mode from prompt content or attached documents
  const lower = trimmed.toLowerCase();

  // 1. Reviewer #2 stress-test / critique
  if (
    lower.includes('reviewer 2') ||
    lower.includes('reviewer #2') ||
    lower.includes('peer review') ||
    lower.includes('critique this') ||
    lower.includes('stress-test') ||
    lower.includes('reject triggers') ||
    lower.includes('weaknesses of')
  ) {
    return { mode: 'review', explicitCommand: false, cleanPrompt: trimmed };
  }

  // 2. Draft academic manuscript
  if (
    lower.startsWith('draft ') ||
    lower.startsWith('write a ') ||
    lower.includes('abstract for') ||
    lower.includes('introduction section') ||
    lower.includes('methodology section') ||
    lower.includes('latex manuscript') ||
    lower.includes('ieee style') ||
    lower.includes('neurips style')
  ) {
    let draftStyle: ModeDetectionResult['draftStyle'] = 'General';
    if (lower.includes('neurips')) draftStyle = 'NeurIPS';
    else if (lower.includes('icml')) draftStyle = 'ICML';
    else if (lower.includes('ieee')) draftStyle = 'IEEE';
    else if (lower.includes('acm')) draftStyle = 'ACM';

    return { mode: 'draft', explicitCommand: false, cleanPrompt: trimmed, draftStyle };
  }

  // 3. Ideate hypothesis & methodology
  if (
    lower.includes('hypothesis') ||
    lower.includes('ideate') ||
    lower.includes('brainstorm') ||
    lower.includes('new architecture') ||
    lower.includes('novel method') ||
    lower.includes('research proposal') ||
    lower.includes('design an algorithm')
  ) {
    return { mode: 'ideate', explicitCommand: false, cleanPrompt: trimmed };
  }

  // 4. Synthesize multi-paper literature
  if (
    hasMultipleDocs ||
    lower.includes('compare papers') ||
    lower.includes('literature matrix') ||
    lower.includes('gap analysis') ||
    lower.includes('synthesize') ||
    lower.includes('taxonomy of') ||
    lower.includes('state of the art')
  ) {
    return { mode: 'synthesize', explicitCommand: false, cleanPrompt: trimmed };
  }

  // 5. Single paper deep-dive
  if (
    hasSingleDoc ||
    lower.includes('analyze this paper') ||
    lower.includes('breakdown') ||
    lower.includes('executive thesis') ||
    lower.includes('problem formulation')
  ) {
    return { mode: 'analyze', explicitCommand: false, cleanPrompt: trimmed };
  }

  return { mode: 'chat', explicitCommand: false, cleanPrompt: trimmed };
}
