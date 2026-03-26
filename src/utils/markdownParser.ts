import MarkdownIt from 'markdown-it';
import footnotePlugin from 'markdown-it-footnote';
import containerPlugin from 'markdown-it-container';
import { v4 as uuid } from 'uuid';
import type { Block, BlockType } from '../types/blocks';

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
md.use(footnotePlugin);
md.use(containerPlugin, 'callout', {
  validate: (params: string) => params.trim().match(/^(info|warning|tip|danger|note)(.*)$/),
});

export function parseMarkdownToBlocks(markdown: string): Block[] {
  const tokens = md.parse(markdown, {});
  const blocks: Block[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.slice(1));
      const contentToken = tokens[i + 1];
      blocks.push({
        id: uuid(),
        type: 'heading',
        content: contentToken?.content || '',
        meta: { level },
      });
      i += 3; // heading_open, inline, heading_close
      continue;
    }

    if (token.type === 'paragraph_open') {
      const contentToken = tokens[i + 1];
      const content = contentToken?.content || '';

      // Check for image-only paragraph
      if (contentToken?.children?.length === 1 && contentToken.children[0].type === 'image') {
        const imgToken = contentToken.children[0];
        blocks.push({
          id: uuid(),
          type: 'image',
          content: imgToken.content || imgToken.attrs?.find(a => a[0] === 'alt')?.[1] || '',
          meta: { src: imgToken.attrs?.find(a => a[0] === 'src')?.[1] || '' },
        });
      } else {
        blocks.push({ id: uuid(), type: 'paragraph', content });
      }
      i += 3;
      continue;
    }

    if (token.type === 'bullet_list_open') {
      const items: string[] = [];
      i++;
      while (i < tokens.length && tokens[i].type !== 'bullet_list_close') {
        if (tokens[i].type === 'list_item_open') {
          i++;
          if (i < tokens.length && tokens[i].type === 'paragraph_open') {
            i++;
            items.push(tokens[i]?.content || '');
            i += 2; // skip inline content + paragraph_close
          }
        }
        i++;
      }
      // Check if it's a checklist
      const isChecklist = items.every(item =>
        item.startsWith('[ ] ') || item.startsWith('[x] ') || item.startsWith('[X] ')
      );
      if (isChecklist) {
        blocks.push({
          id: uuid(),
          type: 'checklist',
          content: items.join('\n'),
        });
      } else {
        blocks.push({
          id: uuid(),
          type: 'unordered-list',
          content: items.join('\n'),
        });
      }
      i++;
      continue;
    }

    if (token.type === 'ordered_list_open') {
      const items: string[] = [];
      const start = token.attrGet?.('start') || (token.meta as { start?: number })?.start || 1;
      i++;
      while (i < tokens.length && tokens[i].type !== 'ordered_list_close') {
        if (tokens[i].type === 'list_item_open') {
          i++;
          if (i < tokens.length && tokens[i].type === 'paragraph_open') {
            i++;
            items.push(tokens[i]?.content || '');
            i += 2;
          }
        }
        i++;
      }
      blocks.push({
        id: uuid(),
        type: 'ordered-list',
        content: items.join('\n'),
        meta: { start },
      });
      i++;
      continue;
    }

    if (token.type === 'blockquote_open') {
      let quoteContent = '';
      i++;
      while (i < tokens.length && tokens[i].type !== 'blockquote_close') {
        if (tokens[i].type === 'paragraph_open') {
          i++;
          quoteContent += (quoteContent ? '\n' : '') + (tokens[i]?.content || '');
          i += 2;
        } else {
          i++;
        }
      }
      blocks.push({ id: uuid(), type: 'blockquote', content: quoteContent });
      i++;
      continue;
    }

    if (token.type === 'fence') {
      const lang = token.info?.trim() || '';
      if (lang === 'mermaid') {
        blocks.push({ id: uuid(), type: 'mermaid', content: token.content.trimEnd() });
      } else if (lang === 'math' || lang === 'katex') {
        blocks.push({ id: uuid(), type: 'math', content: token.content.trimEnd() });
      } else {
        blocks.push({
          id: uuid(),
          type: 'code',
          content: token.content.trimEnd(),
          meta: { language: lang },
        });
      }
      i++;
      continue;
    }

    if (token.type === 'math_block' || token.type === 'math_block_end') {
      blocks.push({ id: uuid(), type: 'math', content: token.content?.trimEnd() || '' });
      i++;
      continue;
    }

    if (token.type === 'hr') {
      blocks.push({ id: uuid(), type: 'hr', content: '' });
      i++;
      continue;
    }

    if (token.type === 'table_open') {
      // Collect raw table markdown by finding the range in the source
      const rows: string[][] = [];
      i++;
      while (i < tokens.length && tokens[i].type !== 'table_close') {
        if (tokens[i].type === 'tr_open') {
          const cells: string[] = [];
          i++;
          while (i < tokens.length && tokens[i].type !== 'tr_close') {
            if (tokens[i].type === 'th_open' || tokens[i].type === 'td_open') {
              i++;
              cells.push(tokens[i]?.content || '');
              i += 2; // content + close
            } else {
              i++;
            }
          }
          rows.push(cells);
        }
        i++;
      }
      blocks.push({
        id: uuid(),
        type: 'table',
        content: rows.map(r => r.join(' | ')).join('\n'),
        meta: { rows },
      });
      i++;
      continue;
    }

    if (token.type === 'container_callout_open') {
      const info = token.info?.trim() || 'info';
      let calloutContent = '';
      i++;
      while (i < tokens.length && tokens[i].type !== 'container_callout_close') {
        if (tokens[i].type === 'paragraph_open') {
          i++;
          calloutContent += (calloutContent ? '\n' : '') + (tokens[i]?.content || '');
          i += 2;
        } else {
          i++;
        }
      }
      blocks.push({
        id: uuid(),
        type: 'callout',
        content: calloutContent,
        meta: { variant: info },
      });
      i++;
      continue;
    }

    if (token.type === 'footnote_block_open') {
      // Collect footnote content
      let footnoteContent = '';
      i++;
      while (i < tokens.length && tokens[i].type !== 'footnote_block_close') {
        if (tokens[i].type === 'footnote_open') {
          const fnId = (tokens[i].meta as { id?: number })?.id ?? 0;
          i++;
          while (i < tokens.length && tokens[i].type !== 'footnote_close') {
            if (tokens[i].type === 'paragraph_open') {
              i++;
              footnoteContent += `[^${fnId + 1}]: ${tokens[i]?.content || ''}\n`;
              i += 2;
            } else {
              i++;
            }
          }
        }
        i++;
      }
      if (footnoteContent) {
        blocks.push({ id: uuid(), type: 'footnote', content: footnoteContent.trimEnd() });
      }
      i++;
      continue;
    }

    i++;
  }

  return blocks;
}

export function getBlockTypeLabel(type: BlockType): string {
  const labels: Record<BlockType, string> = {
    heading: 'H',
    paragraph: 'P',
    'ordered-list': 'OL',
    'unordered-list': 'UL',
    blockquote: 'BQ',
    code: 'CODE',
    image: 'IMG',
    hr: 'HR',
    table: 'TBL',
    checklist: 'CL',
    mermaid: 'MER',
    math: 'MATH',
    callout: 'CALL',
    footnote: 'FN',
  };
  return labels[type];
}
