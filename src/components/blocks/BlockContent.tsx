import { useState, useRef, useEffect } from 'react';
import {
  Heading, Pilcrow, List, ListOrdered, Quote, Code, Image,
  Minus, Table, SquareCheck, GitBranch, Sigma, MessageSquare, FileDown
} from 'lucide-react';
import { useEditor } from '../../store/editorStore';
import type { Block, BlockType } from '../../types/blocks';
import styles from '../../styles/components/BlockContent.module.css';

const blockIcons: Record<BlockType, typeof Heading> = {
  heading: Heading,
  paragraph: Pilcrow,
  'unordered-list': List,
  'ordered-list': ListOrdered,
  blockquote: Quote,
  code: Code,
  image: Image,
  hr: Minus,
  table: Table,
  checklist: SquareCheck,
  mermaid: GitBranch,
  math: Sigma,
  callout: MessageSquare,
  footnote: FileDown,
};

interface BlockContentProps {
  block: Block;
}

export function BlockContent({ block }: BlockContentProps) {
  const { dispatch } = useEditor();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(block.content);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const Icon = blockIcons[block.type];
  const isBasic = ['heading', 'paragraph', 'unordered-list', 'ordered-list'].includes(block.type);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_BLOCK', id: block.id, updates: { content: editValue } });
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(block.content);
      setEditing(false);
    }
  };

  if (block.type === 'hr') {
    return (
      <div className={styles.hrBlock}>
        <Icon size={16} className={isBasic ? styles.iconBasic : styles.iconAdv} />
        <div className={styles.hrLine} />
      </div>
    );
  }

  if (editing) {
    return (
      <div className={styles.editContainer}>
        <Icon size={16} className={isBasic ? styles.iconBasic : styles.iconAdv} />
        <textarea
          ref={inputRef}
          className={styles.editInput}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          rows={Math.max(1, editValue.split('\n').length)}
        />
      </div>
    );
  }

  const displayContent = block.type === 'heading'
    ? block.content
    : block.content.length > 80
      ? block.content.slice(0, 80) + '...'
      : block.content;

  return (
    <div className={styles.display} onDoubleClick={() => setEditing(true)}>
      <Icon size={16} className={isBasic ? styles.iconBasic : styles.iconAdv} />
      <span className={`${styles.text} ${block.type === 'heading' ? styles.headingText : ''}`}>
        {displayContent || '(empty)'}
      </span>
    </div>
  );
}
