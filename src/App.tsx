import { useEffect, useCallback, useRef } from 'react';
import { useEditor } from './store/editorStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileToolbar } from './components/layout/MobileToolbar';
import { TextEditor } from './components/editor/TextEditor';
import { BlockEditor } from './components/editor/BlockEditor';
import { HybridEditor } from './components/editor/HybridEditor';
import { Preview } from './components/editor/Preview';
import { parseMarkdownToBlocks } from './utils/markdownParser';
import { serializeBlocksToMarkdown } from './utils/markdownSerializer';
import styles from './App.module.css';

function AppContent() {
  const { state, dispatch } = useEditor();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const syncTextToBlocks = useCallback((markdown: string) => {
    const blocks = parseMarkdownToBlocks(markdown);
    dispatch({ type: 'SET_BLOCKS', blocks, source: 'text' });
    dispatch({ type: 'CLEAR_CHANGE_SOURCE' });
  }, [dispatch]);

  const syncBlocksToText = useCallback((blocks: typeof state.blocks) => {
    const markdown = serializeBlocksToMarkdown(blocks);
    dispatch({ type: 'SET_RAW_MARKDOWN', markdown, source: 'block' });
    dispatch({ type: 'CLEAR_CHANGE_SOURCE' });
  }, [dispatch]);

  useEffect(() => {
    if (!state.changeSource) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (state.changeSource === 'text') {
        syncTextToBlocks(state.rawMarkdown);
      } else if (state.changeSource === 'block') {
        syncBlocksToText(state.blocks);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state.rawMarkdown, state.blocks, state.changeSource, syncTextToBlocks, syncBlocksToText]);

  const showSidebar = state.mode === 'block' || state.mode === 'hybrid';

  const renderEditor = () => {
    switch (state.mode) {
      case 'text':
        return <TextEditor />;
      case 'block':
        return <BlockEditor />;
      case 'hybrid':
        return <HybridEditor />;
    }
  };

  return (
    <div className={styles.app}>
      <Header />
      <MobileToolbar />
      <div className={styles.body}>
        {showSidebar && <Sidebar />}
        <div className={styles.editorArea}>
          {renderEditor()}
        </div>
        {state.previewVisible && (
          <div className={styles.previewArea}>
            <Preview />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
