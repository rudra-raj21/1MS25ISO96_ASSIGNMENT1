import { ResearchMode } from '../utils/modeDetector';

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year?: number | string;
  venue?: string;
  arxivId?: string;
  url?: string;
  pdfUrl?: string;
  content: string;
  dateAdded: string;
  selected?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ResearchMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: ResearchMode;
  draftStyle?: string;
  timestamp: string;
  groundingSources?: GroundingSource[];
  papersReferenced?: string[]; // IDs or titles of papers
  rawPrompt?: string;
}

export interface GenerationSettings {
  useSearchGrounding: boolean;
  draftStyle: 'NeurIPS' | 'ICML' | 'IEEE' | 'ACM' | 'General';
}
