import {
  Heading, Pilcrow, List, Code, MoreHorizontal,
  Type, LayoutGrid, Columns2
} from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useState } from 'react';
import { useEditor } from '../../store/editorStore';
import type { EditorMode } from '../../types/blocks';
import styles from '../../styles/components/MobileToolbar.module.css';

const quickBlocks = [
  { type: 'heading' as const, label: 'Heading', icon: Heading, content: 'New Heading', meta: { level: 2 } },
  { type: 'paragraph' as const, label: 'Text', icon: Pilcrow, content: 'New paragraph...' },
  { type: 'unordered-list' as const, label: 'List', icon: List, content: 'Item 1\nItem 2' },
  { type: 'code' as const, label: 'Code', icon: Code, content: '// code', meta: { language: '' } },
];

const modes: { key: EditorMode; label: string; icon: typeof Type }[] = [
  { key: 'text', label: 'Text', icon: Type },
  { key: 'block', label: 'Block', icon: LayoutGrid },
  { key: 'hybrid', label: 'Hybrid', icon: Columns2 },
];

export function MobileToolbar() {
  const { state, dispatch } = useEditor();
  const [showMore, setShowMore] = useState(false);

  const addBlock = (option: typeof quickBlocks[0]) => {
    dispatch({
      type: 'ADD_BLOCK',
      block: {
        id: uuid(),
        type: option.type,
        content: option.content,
        meta: option.meta,
      },
    });
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
          <button className={styles.toolBtn} onClick={() => setShowMore(!showMore)}>
            <MoreHorizontal size={20} />
            <span className={styles.toolLabel}>More</span>
          </button>
        </div>
      )}
    </>
  );
}
