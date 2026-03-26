import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { useEditor } from '../../store/editorStore';
import { getBlockTypeLabel } from '../../utils/markdownParser';
import type { Block } from '../../types/blocks';
import { BlockContent } from './BlockContent';
import styles from '../../styles/components/BlockWrapper.module.css';

interface BlockWrapperProps {
  block: Block;
}

export function BlockWrapper({ block }: BlockWrapperProps) {
  const { dispatch } = useEditor();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.wrapper} ${isDragging ? styles.dragging : ''}`}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>
      <div className={styles.content}>
        <BlockContent block={block} />
      </div>
      <div className={styles.meta}>
        <span className={styles.tag}>{getBlockTypeLabel(block.type)}</span>
        <button
          className={styles.deleteBtn}
          onClick={() => dispatch({ type: 'DELETE_BLOCK', id: block.id })}
          title="Delete block"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
