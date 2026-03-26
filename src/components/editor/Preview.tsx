import { useMemo, useEffect, useRef } from 'react';
import MarkdownIt from 'markdown-it';
import footnotePlugin from 'markdown-it-footnote';
import { useEditor } from '../../store/editorStore';
import { serializeBlocksToMarkdown } from '../../utils/markdownSerializer';
import styles from '../../styles/components/Preview.module.css';

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
md.use(footnotePlugin);

export function Preview() {
  const { state, dispatch } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);

  const markdown = useMemo(() => {
    if (state.mode === 'block') {
      return serializeBlocksToMarkdown(state.blocks);
    }
    return state.rawMarkdown;
  }, [state.rawMarkdown, state.blocks, state.mode]);

  const html = useMemo(() => md.render(markdown), [markdown]);

  // Render mermaid diagrams
  useEffect(() => {
    if (!containerRef.current) return;
    const codeBlocks = containerRef.current.querySelectorAll('pre > code.language-mermaid');
    if (codeBlocks.length === 0) return;

    import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, theme: 'default' });
      codeBlocks.forEach(async (el, i) => {
        const pre = el.parentElement;
        if (!pre) return;
        try {
          const { svg } = await mermaid.render(`mermaid-${i}`, el.textContent || '');
          const div = document.createElement('div');
          div.innerHTML = svg;
          div.className = 'mermaid-diagram';
          pre.replaceWith(div);
        } catch {
          // keep original code block on error
        }
      });
    });
  }, [html]);

  // Render KaTeX
  useEffect(() => {
    if (!containerRef.current) return;
    const mathBlocks = containerRef.current.querySelectorAll('pre > code.language-math, pre > code.language-katex');
    if (mathBlocks.length === 0) return;

    import('katex').then(({ default: katex }) => {
      mathBlocks.forEach(el => {
        const pre = el.parentElement;
        if (!pre) return;
        try {
          const div = document.createElement('div');
          div.className = 'katex-block';
          katex.render(el.textContent || '', div, { displayMode: true, throwOnError: false });
          pre.replaceWith(div);
        } catch {
          // keep original
        }
      });
    });
  }, [html]);

  if (!state.previewVisible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Preview</span>
        <button className={styles.closeBtn} onClick={() => dispatch({ type: 'TOGGLE_PREVIEW' })}>
          &times;
        </button>
      </div>
      <div
        ref={containerRef}
        className={`${styles.content} markdown-preview`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
