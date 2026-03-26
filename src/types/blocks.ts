export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'ordered-list'
  | 'unordered-list'
  | 'blockquote'
  | 'code'
  | 'image'
  | 'hr'
  | 'table'
  | 'checklist'
  | 'mermaid'
  | 'math'
  | 'callout'
  | 'footnote';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  meta?: Record<string, unknown>;
  children?: Block[];
}

export type EditorMode = 'text' | 'block' | 'hybrid';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface EditorState {
  blocks: Block[];
  rawMarkdown: string;
  mode: EditorMode;
  previewVisible: boolean;
  theme: ThemeMode;
  fileName: string;
  changeSource: 'text' | 'block' | null;
}

export type EditorAction =
  | { type: 'SET_BLOCKS'; blocks: Block[]; source: 'text' | 'block' }
  | { type: 'SET_RAW_MARKDOWN'; markdown: string; source: 'text' | 'block' }
  | { type: 'SET_MODE'; mode: EditorMode }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'SET_THEME'; theme: ThemeMode }
  | { type: 'SET_FILE_NAME'; fileName: string }
  | { type: 'MOVE_BLOCK'; fromIndex: number; toIndex: number }
  | { type: 'ADD_BLOCK'; block: Block; index?: number }
  | { type: 'UPDATE_BLOCK'; id: string; updates: Partial<Block> }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'CLEAR_CHANGE_SOURCE' };
