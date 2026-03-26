import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEditor } from '../../store/editorStore';
import { BlockWrapper } from '../blocks/BlockWrapper';
import styles from '../../styles/components/BlockEditor.module.css';

export function BlockEditor() {
  const { state, dispatch } = useEditor();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = state.blocks.findIndex(b => b.id === active.id);
    const toIndex = state.blocks.findIndex(b => b.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      dispatch({ type: 'MOVE_BLOCK', fromIndex, toIndex });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.fileName}>{state.fileName}</span>
        <span className={styles.blockCount}>{state.blocks.length} blocks</span>
      </div>
      <div className={styles.blocks}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.blocks.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {state.blocks.map(block => (
              <BlockWrapper key={block.id} block={block} />
            ))}
          </SortableContext>
        </DndContext>
        {state.blocks.length === 0 && (
          <div className={styles.empty}>
            <p>No blocks yet.</p>
            <p>Add blocks from the sidebar or drag them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
