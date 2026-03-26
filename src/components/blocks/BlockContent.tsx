import { useState, useRef, useEffect } from 'react';
import {
  Heading, Pilcrow, List, ListOrdered, Quote, Code, Image,
  Minus, Table, SquareCheck, GitBranch, Sigma, MessageSquare, FileDown,
  Plus, Trash2
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

const headingLevels = [1, 2, 3, 4, 5, 6] as const;
const calloutVariants = ['info', 'warning', 'danger', 'tip', 'note'] as const;
const codeLanguages = ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash', 'go', 'rust', 'java', 'c', 'cpp', 'plain'] as const;

interface BlockContentProps {
  block: Block;
}

export function BlockContent({ block }: BlockContentProps) {
  const { dispatch } = useEditor();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(block.content);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(block.content);
  }, [block.content]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const Icon = blockIcons[block.type];
  const isBasic = ['heading', 'paragraph', 'unordered-list', 'ordered-list'].includes(block.type);

  const editContainerRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_BLOCK', id: block.id, updates: { content: editValue } });
    setEditing(false);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if focus moves to another element within the edit container (e.g. meta buttons)
    if (editContainerRef.current?.contains(e.relatedTarget as Node)) return;
    handleSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;

      if (e.shiftKey) {
        // Shift+Tab: outdent selected lines
        const lines = editValue.split('\n');
        let pos = 0;
        let newStart = start;
        let newEnd = end;
        const newLines = lines.map(line => {
          const lineStart = pos;
          const lineEnd = pos + line.length;
          pos = lineEnd + 1;
          if (lineEnd >= start && lineStart <= end) {
            if (line.startsWith('  ')) {
              if (lineStart <= start) newStart = Math.max(lineStart, newStart - 2);
              newEnd -= 2;
              return line.slice(2);
            }
          }
          return line;
        });
        const val = newLines.join('\n');
        setEditValue(val);
        requestAnimationFrame(() => {
          ta.selectionStart = Math.max(0, newStart);
          ta.selectionEnd = Math.max(0, newEnd);
        });
      } else {
        // Tab: indent at cursor or indent selected lines
        if (start === end) {
          const val = editValue.slice(0, start) + '  ' + editValue.slice(end);
          setEditValue(val);
          requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + 2;
          });
        } else {
          const lines = editValue.split('\n');
          let pos = 0;
          let newEnd = end;
          const newLines = lines.map(line => {
            const lineStart = pos;
            const lineEnd = pos + line.length;
            pos = lineEnd + 1;
            if (lineEnd >= start && lineStart <= end) {
              newEnd += 2;
              return '  ' + line;
            }
            return line;
          });
          const val = newLines.join('\n');
          setEditValue(val);
          requestAnimationFrame(() => {
            ta.selectionStart = start;
            ta.selectionEnd = newEnd;
          });
        }
      }
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(block.content);
      setEditing(false);
    }
  };

  const updateMeta = (key: string, value: unknown) => {
    dispatch({
      type: 'UPDATE_BLOCK',
      id: block.id,
      updates: { meta: { ...block.meta, [key]: value } },
    });
  };

  // --- Table block ---
  if (block.type === 'table') {
    const rows = (block.meta?.rows as string[][] | undefined) || [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']];

    const updateTable = (newRows: string[][]) => {
      dispatch({
        type: 'UPDATE_BLOCK',
        id: block.id,
        updates: {
          content: newRows.map(r => r.join(' | ')).join('\n'),
          meta: { ...block.meta, rows: newRows },
        },
      });
    };

    const updateCell = (rowIdx: number, colIdx: number, value: string) => {
      const newRows = rows.map((r, ri) => ri === rowIdx ? r.map((c, ci) => ci === colIdx ? value : c) : [...r]);
      updateTable(newRows);
    };

    const addRow = () => {
      updateTable([...rows, new Array(rows[0]?.length || 2).fill('')]);
    };

    const deleteRow = (rowIdx: number) => {
      if (rows.length <= 1) return;
      updateTable(rows.filter((_, i) => i !== rowIdx));
    };

    const addCol = () => {
      updateTable(rows.map((r, i) => [...r, i === 0 ? 'Header' : '']));
    };

    const deleteCol = (colIdx: number) => {
      if ((rows[0]?.length || 0) <= 1) return;
      updateTable(rows.map(r => r.filter((_, ci) => ci !== colIdx)));
    };

    return (
      <div className={styles.tableEditor}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                {rows[0]?.map((cell, ci) => (
                  <th key={ci} className={styles.tableCell}>
                    <input
                      className={styles.tableCellInput}
                      value={cell}
                      onChange={e => updateCell(0, ci, e.target.value)}
                      placeholder="Header"
                    />
                    {(rows[0]?.length || 0) > 1 && (
                      <button className={styles.tableDelCol} onClick={() => deleteCol(ci)} title="Delete column">
                        <Trash2 size={10} />
                      </button>
                    )}
                  </th>
                ))}
                <th className={styles.tableAddCol}>
                  <button className={styles.tableAddBtn} onClick={addCol} title="Add column">
                    <Plus size={14} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={styles.tableCell}>
                      <input
                        className={styles.tableCellInput}
                        value={cell}
                        onChange={e => updateCell(ri + 1, ci, e.target.value)}
                        placeholder="..."
                      />
                    </td>
                  ))}
                  <td className={styles.tableRowAction}>
                    {rows.length > 2 && (
                      <button className={styles.tableDelBtn} onClick={() => deleteRow(ri + 1)} title="Delete row">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className={styles.tableAddRowBtn} onClick={addRow}>
          <Plus size={14} />
          <span>Add row</span>
        </button>
      </div>
    );
  }

  // --- HR block ---
  if (block.type === 'hr') {
    return (
      <div className={styles.hrBlock}>
        <Icon size={16} className={isBasic ? styles.iconBasic : styles.iconAdv} />
        <div className={styles.hrLine} />
      </div>
    );
  }

  // --- Editing mode ---
  if (editing) {
    return (
      <div className={styles.editContainer} ref={editContainerRef}>
        <Icon size={16} className={isBasic ? styles.iconBasic : styles.iconAdv} />
        <div className={styles.editBody}>
          {block.type === 'heading' && (
            <div className={styles.metaRow}>
              {headingLevels.map(l => (
                <button
                  key={l}
                  className={`${styles.metaBtn} ${(block.meta?.level || 2) === l ? styles.metaBtnActive : ''}`}
                  onClick={() => updateMeta('level', l)}
                >
                  H{l}
                </button>
              ))}
            </div>
          )}
          {block.type === 'code' && (
            <div className={styles.metaRow}>
              <select
                className={styles.metaSelect}
                value={(block.meta?.language as string) || 'javascript'}
                onChange={e => updateMeta('language', e.target.value)}
              >
                {codeLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}
          {block.type === 'callout' && (
            <div className={styles.metaRow}>
              {calloutVariants.map(v => (
                <button
                  key={v}
                  className={`${styles.metaBtn} ${(block.meta?.variant || 'info') === v ? styles.metaBtnActive : ''}`}
                  onClick={() => updateMeta('variant', v)}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
          {block.type === 'image' && (
            <div className={styles.metaRow}>
              <input
                className={styles.metaInput}
                placeholder="Image URL"
                value={(block.meta?.src as string) || ''}
                onChange={e => updateMeta('src', e.target.value)}
              />
            </div>
          )}
          <textarea
            ref={inputRef}
            className={styles.editInput}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            rows={Math.max(2, editValue.split('\n').length)}
          />
        </div>
      </div>
    );
  }

  // --- Display mode ---
  const level = (block.meta?.level as number) || 2;

  const displayContent = block.content.length > 100
    ? block.content.slice(0, 100) + '...'
    : block.content;

  const typeLabel = (() => {
    switch (block.type) {
      case 'heading': return `H${level}`;
      case 'paragraph': return 'P';
      case 'unordered-list': return 'UL';
      case 'ordered-list': return 'OL';
      case 'blockquote': return 'Quote';
      case 'code': return block.meta?.language ? String(block.meta.language) : 'Code';
      case 'image': return 'Image';
      case 'checklist': return 'Checklist';
      case 'mermaid': return 'Mermaid';
      case 'math': return 'Math';
      case 'callout': return block.meta?.variant ? String(block.meta.variant) : 'Callout';
      case 'footnote': return 'Footnote';
      default: return block.type;
    }
  })();

  return (
    <div className={styles.display} onDoubleClick={() => setEditing(true)}>
      <span className={`${styles.metaTag} ${isBasic ? '' : styles.metaTagAdv}`}>{typeLabel}</span>
      <span className={`${styles.text} ${block.type === 'heading' ? styles.headingText : ''}`}>
        {displayContent || '(empty)'}
      </span>
    </div>
  );
}
