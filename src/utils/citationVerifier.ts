export interface EpistemicSegment {
  type: 'extracted_fact' | 'verified_grounding' | 'analytical_inference' | 'standard_text';
  text: string;
}

export interface VerificationAnalysis {
  citationNeededCount: number;
  extractedFactsCount: number;
  verifiedGroundingCount: number;
  inferenceCount: number;
  followUpActions: string[];
  cleanBody: string;
}

export function parseEpistemicContent(content: string): VerificationAnalysis {
  if (!content) {
    return {
      citationNeededCount: 0,
      extractedFactsCount: 0,
      verifiedGroundingCount: 0,
      inferenceCount: 0,
      followUpActions: [],
      cleanBody: '',
    };
  }

  // Count explicit citation needed flags
  const citationMatches = content.match(/\[Citation Needed\s*-\s*Verify Source\]/gi) || [];
  const citationNeededCount = citationMatches.length;

  // Count knowledge tags
  const factMatches = content.match(/\[Extracted Fact\]/gi) || [];
  const groundingMatches = content.match(/\[Verified (?:Grounding|Source|External Knowledge)\]/gi) || [];
  const inferenceMatches = content.match(/\[Analytical Inference(?:\/Speculation)?\]/gi) || [];

  // Extract 2-3 high leverage follow-up actions
  const followUpActions: string[] = [];
  
  // Look for section headers like "### Follow-up Actions", "### Recommended Follow-up Actions", "### High-Leverage Follow-Up Actions"
  const followUpRegex = /(?:###|\*\*)\s*(?:High-Leverage\s+)?Follow-[uU]p Actions?[\s\S]*?(?=(?:###|$))/i;
  const match = content.match(followUpRegex);
  
  if (match) {
    const block = match[0];
    const lines = block.split('\n');
    for (const line of lines) {
      const bulletMatch = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
      if (bulletMatch && bulletMatch[1].trim()) {
        const action = bulletMatch[1].trim().replace(/\*\*/g, '');
        if (action.length > 5 && !action.toLowerCase().includes('follow-up')) {
          followUpActions.push(action);
        }
      }
    }
  }

  return {
    citationNeededCount,
    extractedFactsCount: factMatches.length,
    verifiedGroundingCount: groundingMatches.length,
    inferenceCount: inferenceMatches.length,
    followUpActions: followUpActions.slice(0, 3),
    cleanBody: content,
  };
}

export function formatCitationIfNeeded(
  title: string,
  authors?: string,
  year?: string | number,
  venue?: string,
  arxivId?: string
): string {
  if (!title) return '[Citation Needed - Verify Source]';
  const parts: string[] = [];
  if (authors) parts.push(authors);
  if (year) parts.push(`(${year})`);
  parts.push(`"${title}"`);
  if (venue) parts.push(`in ${venue}`);
  if (arxivId) parts.push(`arXiv:${arxivId}`);
  return parts.join(' ');
}
