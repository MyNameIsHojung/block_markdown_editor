import {
  Heading, Pilcrow, List, ListOrdered, Code, MoreHorizontal, X,
  Type, LayoutGrid, Columns2, Quote, Minus, Image, Table,
  SquareCheck, GitBranch, Sigma, MessageSquare, FileDown
} from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useState } from 'react';
import { useEditor } from '../../store/editorStore';
import type { BlockType, EditorMode } from '../../types/blocks';
import styles from '../../styles/components/MobileToolbar.module.css';

interface BlockOption {
  type: BlockType;
  label: string;
  icon: typeof Heading;
  content: string;
  meta?: Record<string, unknown>;
}

const quickBlocks: BlockOption[] = [
  { type: 'heading', label: 'Heading', icon: Heading, content: 'New Heading', meta: { level: 2 } },
  { type: 'paragraph', label: 'Text', icon: Pilcrow, content: 'New paragraph...' },
  { type: 'unordered-list', label: 'List', icon: List, content: 'Item 1\nItem 2' },
  { type: 'code', label: 'Code', icon: Code, content: '// code', meta: { language: 'javascript' } },
];

const moreBlocks: BlockOption[] = [
  { type: 'ordered-list', label: 'Numbered', icon: ListOrdered, content: 'First\nSecond\nThird', meta: { start: 1 } },
  { type: 'blockquote', label: 'Quote', icon: Quote, content: 'Quote text...' },
  { type: 'checklist', label: 'Checklist', icon: SquareCheck, content: '[ ] Task 1\n[ ] Task 2\n[x] Done' },
  { type: 'image', label: 'Image', icon: Image, content: 'alt text', meta: { src: '' } },
  { type: 'hr', label: 'Divider', icon: Minus, content: '' },
  { type: 'table', label: 'Table', icon: Table, content: 'Header 1 | Header 2\nCell 1 | Cell 2', meta: { rows: [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']] } },
  { type: 'mermaid', label: 'Mermaid', icon: GitBranch, content: 'graph TD\n  A-->B\n  B-->C' },
  { type: 'math', label: 'Math', icon: Sigma, content: 'E = mc^2' },
  { type: 'callout', label: 'Callout', icon: MessageSquare, content: 'Important note', meta: { variant: 'info' } },
  { type: 'footnote', label: 'Footnote', icon: FileDown, content: '[^1]: Footnote text' },
];

const modes: { key: EditorMode; label: string; icon: typeof Type }[] = [
  { key: 'text', label: 'Text', icon: Type },
  { key: 'block', label: 'Block', icon: LayoutGrid },
  { key: 'hybrid', label: 'Hybrid', icon: Columns2 },
];

export function MobileToolbar() {
  const { state, dispatch } = useEditor();
  const [showMore, setShowMore] = useState(false);

  const addBlock = (option: BlockOption) => {
    dispatch({
      type: 'ADD_BLOCK',
      block: {
        id: uuid(),
        type: option.type,
        content: option.content,
        meta: option.meta,
      },
    });
    setShowMore(false);
  };

  return (
    <>
      {/* Mobile mode selector */}
      <div className={styles.modeBar}>
        {modes.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.modeBtn} ${state.mode === key ? styles.modeBtnActive : ''}`}
            onClick={() => dispatch({ type: 'SET_MODE', mode: key })}
          >
            {label}
          </button>
        ))}
      </div>

      {/* More blocks panel */}
      {showMore && (state.mode === 'block' || state.mode === 'hybrid') && (
        <div className={styles.morePanel}>
          <div className={styles.morePanelHeader}>
            <span>All Blocks</span>
            <button className={styles.morePanelClose} onClick={() => setShowMore(false)}>
              <X size={16} />
            </button>
          </div>
          <div className={styles.moreGrid}>
            {moreBlocks.map(option => (
              <button
                key={option.type}
                className={styles.moreItem}
                onClick={() => addBlock(option)}
              >
                <option.icon size={18} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom toolbar */}
      {(state.mode === 'block' || state.mode === 'hybrid') && (
        <div className={styles.toolbar}>
          {quickBlocks.map(option => (
            <button
              key={option.type}
              className={styles.toolBtn}
              onClick={() => addBlock(option)}
            >
              <option.icon size={20} />
              <span className={styles.toolLabel}>{option.label}</span>
            </button>
          ))}
          <button
            className={`${styles.toolBtn} ${showMore ? styles.toolBtnActive : ''}`}
            onClick={() => setShowMore(!showMore)}
          >
            <MoreHorizontal size={20} />
            <span className={styles.toolLabel}>More</span>
          </button>
        </div>
      )}
    </>
  );
}
