import type { Block } from '../types/blocks';

export function serializeBlocksToMarkdown(blocks: Block[]): string {
  return blocks.map(serializeBlock).join('\n\n');
}

function serializeBlock(block: Block): string {
  switch (block.type) {
    case 'heading': {
      const level = (block.meta?.level as number) || 1;
      return '#'.repeat(level) + ' ' + block.content;
    }
    case 'paragraph':
      return block.content;
    case 'unordered-list':
      return block.content
        .split('\n')
        .map(item => `- ${item}`)
        .join('\n');
    case 'ordered-list': {
      const start = (block.meta?.start as number) || 1;
      return block.content
        .split('\n')
        .map((item, i) => `${start + i}. ${item}`)
        .join('\n');
    }
    case 'checklist':
      return block.content
        .split('\n')
        .map(item => {
          if (item.startsWith('[x] ') || item.startsWith('[X] ')) {
            return `- ${item}`;
          }
          if (item.startsWith('[ ] ')) {
            return `- ${item}`;
          }
          return `- [ ] ${item}`;
        })
        .join('\n');
    case 'blockquote':
      return block.content
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n');
    case 'code': {
      const lang = (block.meta?.language as string) || '';
      return '```' + lang + '\n' + block.content + '\n```';
    }
    case 'image': {
      const src = (block.meta?.src as string) || '';
      return `![${block.content}](${src})`;
    }
    case 'hr':
      return '---';
    case 'table': {
      const rows = block.meta?.rows as string[][] | undefined;
      if (rows && rows.length > 0) {
        const header = '| ' + rows[0].join(' | ') + ' |';
        const separator = '| ' + rows[0].map(() => '---').join(' | ') + ' |';
        const body = rows
          .slice(1)
          .map(row => '| ' + row.join(' | ') + ' |')
          .join('\n');
        return [header, separator, body].filter(Boolean).join('\n');
      }
      return block.content;
    }
    case 'mermaid':
      return '```mermaid\n' + block.content + '\n```';
    case 'math':
      return '$$\n' + block.content + '\n$$';
    case 'callout': {
      const variant = (block.meta?.variant as string) || 'info';
      return `::: ${variant}\n${block.content}\n:::`;
    }
    case 'footnote':
      return block.content;
    default:
      return block.content;
  }
}
