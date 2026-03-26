import { TextEditor } from './TextEditor';
import { BlockEditor } from './BlockEditor';
import styles from '../../styles/components/HybridEditor.module.css';

export function HybridEditor() {
  return (
    <div className={styles.container}>
      <div className={styles.pane}>
        <TextEditor />
      </div>
      <div className={styles.divider} />
      <div className={styles.pane}>
        <BlockEditor />
      </div>
    </div>
  );
}
