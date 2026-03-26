import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { EditorState, EditorAction, Block } from '../types/blocks';

const initialState: EditorState = {
  blocks: [],
  rawMarkdown: '',
  mode: 'text',
  previewVisible: false,
  theme: 'system',
  fileName: 'untitled.md',
  changeSource: null,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_BLOCKS':
      return { ...state, blocks: action.blocks, changeSource: action.source };
    case 'SET_RAW_MARKDOWN':
      return { ...state, rawMarkdown: action.markdown, changeSource: action.source };
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'TOGGLE_PREVIEW':
      return { ...state, previewVisible: !state.previewVisible };
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_FILE_NAME':
      return { ...state, fileName: action.fileName };
    case 'MOVE_BLOCK': {
      const blocks = [...state.blocks];
      const [moved] = blocks.splice(action.fromIndex, 1);
      blocks.splice(action.toIndex, 0, moved);
      return { ...state, blocks, changeSource: 'block' };
    }
    case 'ADD_BLOCK': {
      const blocks = [...state.blocks];
      const index = action.index ?? blocks.length;
      blocks.splice(index, 0, action.block);
      return { ...state, blocks, changeSource: 'block' };
    }
    case 'UPDATE_BLOCK': {
      const blocks = state.blocks.map((b: Block) =>
        b.id === action.id ? { ...b, ...action.updates } : b
      );
      return { ...state, blocks, changeSource: 'block' };
    }
    case 'DELETE_BLOCK': {
      const blocks = state.blocks.filter((b: Block) => b.id !== action.id);
      return { ...state, blocks, changeSource: 'block' };
    }
    case 'CLEAR_CHANGE_SOURCE':
      return { ...state, changeSource: null };
    default:
      return state;
  }
}

const EditorContext = createContext<{
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
}>({ state: initialState, dispatch: () => {} });

export function useEditor() {
  return useContext(EditorContext);
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}
