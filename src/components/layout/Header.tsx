import { useState, useRef, useEffect } from 'react';
import { FileText, Type, LayoutGrid, Columns2, Eye, EyeOff, Download, Upload, Sun, Moon, Monitor, Pencil } from 'lucide-react';
import { useEditor } from '../../store/editorStore';
import { useTheme } from '../../theme/ThemeProvider';
import { saveMarkdownFile, loadMarkdownFile } from '../../utils/fileIO';
import { serializeBlocksToMarkdown } from '../../utils/markdownSerializer';
import { parseMarkdownToBlocks } from '../../utils/markdownParser';
import type { EditorMode } from '../../types/blocks';
import styles from '../../styles/components/Header.module.css';

const modes: { key: EditorMode; label: string; icon: typeof Type }[] = [
  { key: 'text', label: 'Text', icon: Type },
  { key: 'block', label: 'Block', icon: LayoutGrid },
  { key: 'hybrid', label: 'Hybrid', icon: Columns2 },
];

const themeOptions = [
  { key: 'light' as const, icon: Sun, label: 'Light' },
  { key: 'dark' as const, icon: Moon, label: 'Dark' },
  { key: 'system' as const, icon: Monitor, label: 'System' },
];

export function Header() {
  const { state, dispatch } = useEditor();
  const { theme, setTheme } = useTheme();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(state.fileName);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameValue(state.fileName);
  }, [state.fileName]);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const handleNameSave = () => {
    const name = nameValue.trim() || 'untitled.md';
    dispatch({ type: 'SET_FILE_NAME', fileName: name.endsWith('.md') ? name : name + '.md' });
    setEditingName(false);
  };

  const handleSave = () => {
    const markdown = state.mode === 'text' || state.mode === 'hybrid'
      ? state.rawMarkdown
      : serializeBlocksToMarkdown(state.blocks);
    saveMarkdownFile(markdown, state.fileName);
  };

  const handleLoad = async () => {
    try {
      const { content, fileName } = await loadMarkdownFile();
      dispatch({ type: 'SET_FILE_NAME', fileName });
      dispatch({ type: 'SET_RAW_MARKDOWN', markdown: content, source: 'text' });
      dispatch({ type: 'SET_BLOCKS', blocks: parseMarkdownToBlocks(content), source: 'text' });
    } catch {
      // user cancelled
    }
  };

  const cycleTheme = () => {
    const current = themeOptions.findIndex(t => t.key === theme);
    const next = themeOptions[(current + 1) % themeOptions.length];
    setTheme(next.key);
  };

  const currentThemeOption = themeOptions.find(t => t.key === theme) || themeOptions[0];
  const ThemeIcon = currentThemeOption.icon;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <FileText size={20} className={styles.logo} />
        {editingName ? (
          <input
            ref={nameInputRef}
            className={styles.nameInput}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSave();
              if (e.key === 'Escape') { setNameValue(state.fileName); setEditingName(false); }
            }}
          />
        ) : (
          <button className={styles.nameBtn} onClick={() => setEditingName(true)}>
            <span className={styles.fileName}>{state.fileName}</span>
            <Pencil size={12} className={styles.nameEditIcon} />
          </button>
        )}
      </div>

      <div className={styles.modeGroup}>
        {modes.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`${styles.modeBtn} ${state.mode === key ? styles.modeBtnActive : ''}`}
            onClick={() => dispatch({ type: 'SET_MODE', mode: key })}
          >
            <Icon size={14} />
            <span className={styles.modeBtnLabel}>{label}</span>
          </button>
        ))}
      </div>

      <div className={styles.right}>
        <button
          className={`${styles.actionBtn} ${state.previewVisible ? styles.previewActive : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_PREVIEW' })}
        >
          {state.previewVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          <span className={styles.actionLabel}>{state.previewVisible ? 'Preview ON' : 'Preview OFF'}</span>
        </button>
        <button className={`${styles.actionBtn} ${styles.saveBtn}`} onClick={handleSave}>
          <Download size={14} />
          <span className={styles.actionLabel}>Save</span>
        </button>
        <button className={styles.actionBtn} onClick={handleLoad}>
          <Upload size={14} />
          <span className={styles.actionLabel}>Load</span>
        </button>
        <button className={styles.themeBtn} onClick={cycleTheme} title={currentThemeOption.label}>
          <ThemeIcon size={16} />
        </button>
      </div>
    </header>
  );
}
