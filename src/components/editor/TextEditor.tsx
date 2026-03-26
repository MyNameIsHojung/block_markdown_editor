import { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus, Link, Image, Table, SquareCheck
} from 'lucide-react';
import { useEditor } from '../../store/editorStore';
import styles from '../../styles/components/TextEditor.module.css';

interface ToolbarAction {
  icon: typeof Bold;
  label: string;
  prefix: string;
  suffix?: string;
  block?: boolean;
}

const toolbarActions: ToolbarAction[] = [
  { icon: Bold, label: 'Bold', prefix: '**', suffix: '**' },
  { icon: Italic, label: 'Italic', prefix: '*', suffix: '*' },
  { icon: Strikethrough, label: 'Strikethrough', prefix: '~~', suffix: '~~' },
  { icon: Code, label: 'Inline Code', prefix: '`', suffix: '`' },
  { icon: Link, label: 'Link', prefix: '[', suffix: '](url)' },
];

const blockActions: ToolbarAction[] = [
  { icon: Heading1, label: 'Heading 1', prefix: '# ', block: true },
  { icon: Heading2, label: 'Heading 2', prefix: '## ', block: true },
  { icon: Heading3, label: 'Heading 3', prefix: '### ', block: true },
  { icon: List, label: 'Bullet List', prefix: '- ', block: true },
  { icon: ListOrdered, label: 'Numbered List', prefix: '1. ', block: true },
  { icon: SquareCheck, label: 'Checklist', prefix: '- [ ] ', block: true },
  { icon: Quote, label: 'Blockquote', prefix: '> ', block: true },
  { icon: Minus, label: 'Divider', prefix: '\n---\n', block: true },
  { icon: Image, label: 'Image', prefix: '![alt](', suffix: ')', block: true },
  { icon: Table, label: 'Table', prefix: '\n| Header | Header |\n| --- | --- |\n| Cell | Cell |\n', block: true },
];

export function TextEditor() {
  const { state, dispatch } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isExternalUpdate = useRef(false);

  const onUpdate = useCallback((content: string) => {
    if (!isExternalUpdate.current) {
      dispatch({ type: 'SET_RAW_MARKDOWN', markdown: content, source: 'text' });
    }
  }, [dispatch]);

  useEffect(() => {
    if (!containerRef.current) return;

    const startState = EditorState.create({
      doc: state.rawMarkdown,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onUpdate(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" },
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    viewRef.current = view;
    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (state.changeSource === 'text') return;

    const currentContent = view.state.doc.toString();
    if (currentContent !== state.rawMarkdown) {
      isExternalUpdate.current = true;
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: state.rawMarkdown,
        },
      });
      isExternalUpdate.current = false;
    }
  }, [state.rawMarkdown, state.changeSource]);

  const insertMarkdown = (action: ToolbarAction) => {
    const view = viewRef.current;
    if (!view) return;

    const { from, to } = view.state.selection.main;
    const selected = view.state.sliceDoc(from, to);

    let insert: string;
    if (action.block && !selected) {
      insert = action.prefix + (action.suffix || '');
    } else if (action.suffix) {
      insert = action.prefix + (selected || action.label) + action.suffix;
    } else {
      insert = action.prefix + (selected || '');
    }

    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: from + insert.length },
    });
    view.focus();
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          {toolbarActions.map(action => (
            <button
              key={action.label}
              className={styles.toolBtn}
              onClick={() => insertMarkdown(action)}
              title={action.label}
            >
              <action.icon size={15} />
            </button>
          ))}
        </div>
        <div className={styles.toolDivider} />
        <div className={styles.toolGroup}>
          {blockActions.map(action => (
            <button
              key={action.label}
              className={styles.toolBtn}
              onClick={() => insertMarkdown(action)}
              title={action.label}
            >
              <action.icon size={15} />
            </button>
          ))}
        </div>
      </div>
      <div className={styles.editor} ref={containerRef} />
    </div>
  );
}
