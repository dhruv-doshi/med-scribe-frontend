export type ScribeType = 'summarize' | 'generate'
export type NoteType = 'general' | 'meeting' | 'research' | 'clinical'
export type ScribeStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ScribeSession {
  id: string
  type: ScribeType
  status: ScribeStatus
  result: SummarizationResult | NoteGenerationResult | null
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
}

export interface SummarizeRequest {
  text: string
}

export interface GenerateNotesRequest {
  text: string
  note_type: NoteType
}
