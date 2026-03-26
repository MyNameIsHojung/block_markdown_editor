# BlockMD

웹 기반 블록 마크다운 에디터. TypeScript + React로 구현되었습니다.

## Features

### 3가지 편집 모드

| 모드 | 설명 |
|------|------|
| **Text** | CodeMirror 기반 마크다운 텍스트 에디터. 구문 강조, 라인 넘버 지원 |
| **Block** | 드래그앤드롭 블록 에디터. 사이드바에서 블록을 선택/드래그하여 삽입 |
| **Hybrid** | 텍스트 + 블록 분할 뷰. 양쪽 실시간 동기화 |

### 블록 타입

**기본 블록**: Heading (H1~H6), Paragraph, Bullet List, Numbered List, Blockquote, Code Block, Image, Divider (HR)

**확장 블록**: Table, Checklist, Mermaid Diagram, Math (KaTeX), Callout/Admonition, Footnote

### 기타

- **실시간 프리뷰** - 토글 버튼으로 켜고 끌 수 있음
- **파일 저장/불러오기** - `.md` 파일로 저장하고 기존 마크다운 파일을 불러와 편집 가능
- **테마** - Light / Dark / System 3가지 테마 지원
- **반응형 UI** - PC (사이드바 블록 팔레트) / Mobile (하단 툴바) 대응

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - 빌드 도구
- **CodeMirror 6** - 텍스트 에디터 (마크다운 구문 강조)
- **markdown-it** - 마크다운 파싱/렌더링
- **@dnd-kit** - 드래그앤드롭
- **Mermaid** - 다이어그램 렌더링
- **KaTeX** - 수식 렌더링
- **Lucide React** - 아이콘

## Getting Started

### 설치

```bash
npm install
```

### 개발 서버

```bash
npm run dev
```

`http://localhost:5173` 에서 확인할 수 있습니다.

### 빌드

```bash
npm run build
```

`dist/` 폴더에 정적 파일이 생성됩니다.

### 프리뷰 (빌드 결과 확인)

```bash
npm run preview
```

## Project Structure

```
src/
├── types/blocks.ts              # Block, EditorState 타입 정의
├── store/editorStore.tsx         # React Context + useReducer 상태관리
├── theme/
│   ├── variables.css             # CSS 변수 (Light/Dark)
│   └── ThemeProvider.tsx         # 테마 컨텍스트
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # 상단 바 (모드/테마/파일 IO)
│   │   ├── Sidebar.tsx           # 블록 팔레트 (PC)
│   │   └── MobileToolbar.tsx     # 블록 팔레트 (Mobile)
│   ├── editor/
│   │   ├── TextEditor.tsx        # CodeMirror 텍스트 에디터
│   │   ├── BlockEditor.tsx       # 블록 에디터 + DnD
│   │   ├── HybridEditor.tsx      # 분할 뷰
│   │   └── Preview.tsx           # 마크다운 프리뷰
│   └── blocks/
│       ├── BlockWrapper.tsx      # 드래그 핸들 + 삭제
│       └── BlockContent.tsx      # 블록별 렌더링/편집
├── utils/
│   ├── markdownParser.ts         # markdown-it Token → Block[]
│   ├── markdownSerializer.ts     # Block[] → markdown string
│   └── fileIO.ts                 # 파일 저장/불러오기
└── styles/
    ├── global.css                # 전역 스타일 + 프리뷰 스타일
    └── components/               # CSS Modules
```

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Plum | `#5A3F42` | Header, Sidebar 배경 |
| Brown | `#705247` | 보조 강조 |
| Olive Brown | `#7C6A4E` | 테두리, 워밍 액센트 |
| Olive Green | `#7D8560` | 블록 호버, 기본 블록 아이콘 |
| Sage Green | `#74A081` | Secondary 색상, 확장 블록 아이콘 |
| Teal | `#67BAB1` | Primary 액센트, 활성 상태, CTA |

## License

MIT
