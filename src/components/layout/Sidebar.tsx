import {
  Heading, Pilcrow, List, ListOrdered, Quote, Code, Image, Minus,
  Table, SquareCheck, GitBranch, Sigma, MessageSquare, FileDown
} from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useEditor } from '../../store/editorStore';
import type { Block, BlockType } from '../../types/blocks';
import styles from '../../styles/components/Sidebar.module.css';

interface BlockOption {
  type: BlockType;
  label: string;
  icon: typeof Heading;
  group: 'basic' | 'advanced';
  defaultContent: string;
  defaultMeta?: Record<string, unknown>;
}

const blockOptions: BlockOption[] = [
  { type: 'heading', label: 'Heading', icon: Heading, group: 'basic', defaultContent: 'New Heading', defaultMeta: { level: 2 } },
  { type: 'paragraph', label: 'Paragraph', icon: Pilcrow, group: 'basic', defaultContent: 'New paragraph text...' },
  { type: 'unordered-list', label: 'Bullet List', icon: List, group: 'basic', defaultContent: 'Item 1\nItem 2\nItem 3' },
  { type: 'ordered-list', label: 'Numbered List', icon: ListOrdered, group: 'basic', defaultContent: 'First\nSecond\nThird', defaultMeta: { start: 1 } },
  { type: 'blockquote', label: 'Blockquote', icon: Quote, group: 'basic', defaultContent: 'Quote text...' },
  { type: 'code', label: 'Code Block', icon: Code, group: 'basic', defaultContent: '// code here', defaultMeta: { language: 'javascript' } },
  { type: 'image', label: 'Image', icon: Image, group: 'basic', defaultContent: 'alt text', defaultMeta: { src: '' } },
  { type: 'hr', label: 'Divider', icon: Minus, group: 'basic', defaultContent: '' },
  { type: 'table', label: 'Table', icon: Table, group: 'advanced', defaultContent: 'Header 1 | Header 2\nCell 1 | Cell 2', defaultMeta: { rows: [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']] } },
  { type: 'checklist', label: 'Checklist', icon: SquareCheck, group: 'advanced', defaultContent: '[ ] Task 1\n[ ] Task 2\n[x] Done task' },
  { type: 'mermaid', label: 'Mermaid', icon: GitBranch, group: 'advanced', defaultContent: 'graph TD\n  A-->B\n  B-->C' },
  { type: 'math', label: 'Math', icon: Sigma, group: 'advanced', defaultContent: 'E = mc^2' },
  { type: 'callout', label: 'Callout', icon: MessageSquare, group: 'advanced', defaultContent: 'Important note here', defaultMeta: { variant: 'info' } },
  { type: 'footnote', label: 'Footnote', icon: FileDown, group: 'advanced', defaultContent: '[^1]: Footnote text' },
];

export function Sidebar() {
  const { dispatch } = useEditor();

  const addBlock = (option: BlockOption) => {
    const block: Block = {
      id: uuid(),
      type: option.type,
      content: option.defaultContent,
      meta: option.defaultMeta,
    };
    dispatch({ type: 'ADD_BLOCK', block });
  };

  const basicBlocks = blockOptions.filter(b => b.group === 'basic');
  const advancedBlocks = blockOptions.filter(b => b.group === 'advanced');

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sectionTitle}>Blocks</div>

      <div className={styles.group}>
        <div className={styles.groupLabel}>BASIC</div>
        {basicBlocks.map(option => (
          <button
            key={option.type}
            className={styles.blockItem}
            onClick={() => addBlock(option)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/block-type', JSON.stringify(option));
              e.dataTransfer.effectAllowed = 'copy';
            }}
          >
            <option.icon size={16} className={styles.blockIcon} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.group}>
        <div className={styles.groupLabel}>ADVANCED</div>
        {advancedBlocks.map(option => (
          <button
            key={option.type}
            className={styles.blockItem}
            onClick={() => addBlock(option)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/block-type', JSON.stringify(option));
              e.dataTransfer.effectAllowed = 'copy';
            }}
          >
            <option.icon size={16} className={styles.blockIconAdv} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
