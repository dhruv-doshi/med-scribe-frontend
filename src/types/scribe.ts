export type ScribeType = 'summarize' | 'generate'
export type NoteType = 'general' | 'meeting' | 'research' | 'clinical'
export type ScribeStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface SpeakerSegment {
  speaker: string
  text: string
}

export interface TranscribeResult {
  segments: SpeakerSegment[]
  full_text: string
}

export interface DoctorSuggestion {
  id: string
  question: string
  options: string[]
  category: 'observation' | 'plan'
}

export interface DoctorSuggestionAnswer {
  suggestion_id: string
  selected_option: string | null
  custom_answer: string
}

export interface ScribeSession {
  id: string
  type: ScribeType
  status: ScribeStatus
  result: SummarizationResult | NoteGenerationResult | null
  title?: string
  doctor_answers?: DoctorSuggestionAnswer[]
  created_at: string
}

export interface SummarizationResult {
  summary: string
  key_points: string[]
  entities: {
    medications: string[]
    conditions: string[]
    procedures: string[]
  }
  word_count: number
}

export interface NoteGenerationResult {
  // General / meeting / research notes
  title?: string
  sections?: Array<{ heading: string; content: string }>
  action_items?: string[]
  summary?: string
  // Meeting-specific
  attendees?: string[]
  decisions?: string[]
  discussion_points?: Array<{ topic: string; notes: string }>
  // Research-specific
  hypothesis?: string
  methodology?: string
  findings?: string[]
  conclusions?: string[]
  references?: string[]
  // Clinical SOAP
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  medications?: string[]
  follow_up?: string
  // Doctor observations (MCQ suggestions)
  suggestions?: DoctorSuggestion[]
}

export interface SummarizeRequest {
  text: string
}

export interface GenerateNotesRequest {
  text: string
  note_type: NoteType
}

export interface UpdateSessionRequest {
  title?: string
  result?: Partial<NoteGenerationResult>
}
