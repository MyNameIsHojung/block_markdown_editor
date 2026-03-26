import { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { useEditor } from '../../store/editorStore';
import styles from '../../styles/components/TextEditor.module.css';

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
        keymap.of([...defaultKeymap, ...historyKeymap]),
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

  // Sync external changes to editor
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.fileName}>{state.fileName}</span>
      </div>
      <div className={styles.editor} ref={containerRef} />
    </div>
  );
}
