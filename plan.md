# GitHub Pages 정적 블로그 구축 계획

## 📋 프로젝트 개요

- 배포: suhyunkim-maker.github.io
- 기술: HTML, CSS, Vanilla JavaScript
- 마크다운 파싱: marked.js (CDN)
- 코드 하이라이팅: Prism.js
- 댓글: Giscus (GitHub Discussions)
- 빌드: GitHub Actions (자동)

## 📁 디렉토리 구조

```sh
/
├── .nojekyll # Jekyll 비활성화 (필수!)
├── index.html # 메인 페이지 (게시글 목록)
├── post.html # 게시글 상세 페이지
├── css/
│ ├── style.css # 메인 스타일 (다크/라이트 모드)
│ └── prism.css # 코드 하이라이팅 테마
├── js/
│ ├── app.js # 메인 애플리케이션 로직
│ ├── post-loader.js # 마크다운 로딩 및 파싱
│ ├── search.js # 검색 기능
│ └── theme.js # 다크/라이트 모드 토글
├── pages/ # 마크다운 게시글 폴더
│ └── example.md
├── .github/
│ ├── workflows/
│ │ └── deploy.yml # GitHub Pages 배포
│ └── scripts/
│   └── generate-posts.js # posts.json 생성 스크립트
└── posts.json # 게시글 메타데이터 (배포 시 자동 생성)
```

## 🔧 구현 단계

### 1단계: 기본 HTML 구조

- index.html: 게시글 목록, 검색창, 태그 필터
- post.html: 게시글 본문, Giscus 댓글

### 2단계: CSS 스타일링

- 미니멀 디자인 (여백 중심, 타이포그래피 강조)
- CSS 변수 기반 다크/라이트 모드
- 반응형 레이아웃

### 3단계: JavaScript 기능

- marked.js로 마크다운 → HTML 변환
- Front Matter 파싱 (제목, 날짜, 태그, 카테고리 추출)
- 태그/카테고리 필터링
- 클라이언트 사이드 검색
- 다크/라이트 모드 토글

### 4단계: Giscus 통합

- GitHub Discussions 설정
- Giscus 설정 및 스크립트 추가

### 5단계: GitHub Actions 워크플로우

**중요**: YAML 파일에 복잡한 JavaScript 인라인 코드를 넣으면 따옴표 이스케이프 문제가 발생합니다.
반드시 별도 `.js` 파일로 분리하세요.

#### `.github/workflows/deploy.yml`

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Generate posts.json
        run: node .github/scripts/generate-posts.js

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### `.github/scripts/generate-posts.js`

````javascript
const fs = require('fs');
const path = require('path');

const postsDir = 'pages';
const outputFile = 'posts.json';

if (!fs.existsSync(postsDir)) {
  console.log('pages 디렉토리가 없습니다. 빈 posts.json을 생성합니다.');
  fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
  process.exit(0);
}

const files = fs
  .readdirSync(postsDir)
  .filter((file) => file.endsWith('.md'))
  .sort((a, b) => b.localeCompare(a));

const posts = files.map((filename) => {
  const filePath = path.join(postsDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  // UTF-8 BOM 제거 (Windows 호환)
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }

  // Front Matter 파싱 (Windows 줄바꿈 지원)
  const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  let metadata = {};
  let postContent = content;

  if (frontMatterMatch) {
    const frontMatter = frontMatterMatch[1];
    postContent = frontMatterMatch[2];

    // Front Matter 라인 파싱 (Windows 줄바꿈 지원)
    const lines = frontMatter.split(/\r?\n/);
    lines.forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // 따옴표 제거
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // 배열 파싱 (tags)
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch {
            value = value
              .slice(1, -1)
              .split(',')
              .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''));
          }
        }

        metadata[key] = value;
      }
    });
  }

  // 발췌문 생성 (첫 200자)
  const excerpt = postContent
    .replace(/#.*$/gm, '') // 헤더 제거
    .replace(/```[\s\S]*?```/g, '') // 코드 블록 제거
    .replace(/\[[\s\S]*?\]/g, '') // 링크 제거
    .replace(/\*\*.*\*\*/g, '') // 볼드 제거
    .replace(/\*.*\*/g, '') // 이탤릭 제거
    .replace(/[\r\n]+/g, ' ') // 줄바꿈을 공백으로 (Windows 지원)
    .trim()
    .substring(0, 200)
    .trim();

  return {
    file: filename,
    title: metadata.title || filename.replace('.md', ''),
    date: metadata.date || new Date().toISOString().split('T')[0],
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    category: metadata.category || '',
    description: metadata.description || '',
    excerpt: excerpt + (excerpt.length === 200 ? '...' : ''),
  };
});

// 날짜순 정렬 (최신순)
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
console.log(`Generated posts.json with ${posts.length} posts`);
````

**금지사항**: `node -e "복잡한 코드..."` 형태의 인라인 스크립트 사용 금지

### 6단계: 코드 하이라이팅

- Prism.js CDN 추가
- 주요 언어 지원 설정

## 📝 마크다운 파일 형식 예시

```markdown
---
title: '첫 번째 게시글'
date: 2025-01-26
tags: ['JavaScript', 'Web']
category: 'Development'
description: '게시글 설명'
---

# 제목

내용...
```

## 🚀 배포 플로우

1. pages/에 `.md` 파일 작성
2. git push
3. GitHub Actions 자동 실행:
   - posts.json 생성
   - GitHub Pages 배포
4. https://{your_github_username}.github.io 접속

## ⚠️ 중요 사항

### 1. UTF-8 BOM 처리 (Windows 호환)

**Windows에서 파일 저장 시 UTF-8 BOM(Byte Order Mark)이 자동으로 추가될 수 있습니다.**

**문제점**:
- Windows 메모장이나 일부 에디터는 기본적으로 UTF-8 BOM(`\uFEFF`)으로 저장
- BOM이 있으면 Front Matter 정규식 `^---`가 매칭 실패
- 결과: 메타데이터 파싱 실패 → 게시글 제목, 태그 등이 표시되지 않음

**해결책**: `generate-posts.js`에 BOM 제거 코드 포함 (이미 적용됨)

```javascript
// UTF-8 BOM 제거 (Windows 호환)
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}
```

**권장 에디터 설정**:
- VS Code / Cursor: 파일 저장 시 "UTF-8" 선택 (BOM 없음)
- 우측 하단 인코딩 클릭 → "Save with Encoding" → "UTF-8" 선택

### 2. .nojekyll 파일 필수

**반드시 루트 디렉토리에 `.nojekyll` 빈 파일을 생성**하세요:

```bash
touch .nojekyll
git add .nojekyll
git commit -m "fix: Jekyll 비활성화"
git push origin main
```

**이유**:

- GitHub Pages는 기본적으로 Jekyll을 사용하여 빌드 프로세스를 수행
- Jekyll이 활성화되면 일부 파일(특히 `pages/` 폴더의 `.md` 파일)이 제대로 서빙되지 않음
- `.nojekyll` 파일이 있으면 Jekyll을 완전히 비활성화하고 순수 정적 파일로 서빙
- 이 파일이 없으면 **게시글이 404 에러로 불러와지지 않음**

### 3. GitHub Actions 스크립트 작성 가이드

**원칙**: YAML 워크플로우에서 복잡한 로직은 반드시 별도 파일로 분리

#### ✅ 올바른 방법

```yaml
- name: Generate posts.json
  run: node .github/scripts/generate-posts.js
```

#### ❌ 잘못된 방법

```yaml
- name: Generate posts.json
  run: node -e "const value = 'test'..." # 이스케이프 오류 발생
```

**이유**: YAML에서 따옴표, 백슬래시 이스케이프가 복잡하고 디버깅이 어려움

### 4. JavaScript 전역 변수 충돌 방지

**여러 JS 파일에서 같은 이름의 전역 변수를 선언하면 에러가 발생합니다.**

**문제 예시**:
```javascript
// search.js
let allPosts = [];  // ❌ 충돌!

// app.js
let allPosts = [];  // ❌ 충돌!
```

**에러 메시지**:
```
Uncaught SyntaxError: Identifier 'allPosts' has already been declared
```

**해결책**: 각 파일에서 고유한 변수명 사용
```javascript
// search.js
let searchPosts = [];  // ✅ 고유한 이름

// app.js
let allPosts = [];     // ✅ 고유한 이름
```

**권장 사항**:
- 각 모듈에서 사용하는 변수는 해당 모듈을 나타내는 접두사 사용
- 또는 ES6 모듈 시스템 (`import`/`export`) 사용 고려

### 5. posts.json 관리

`posts.json`은 GitHub Actions가 **배포 시점에** 자동으로 생성하는 파일입니다.

#### ✅ 권장 방법: Git에 커밋

`posts.json`을 `.gitignore`에 넣지 말고 Git에 커밋하세요:

```bash
git add posts.json
git commit -m "chore: posts.json을 Git에 포함"
git push origin main
```

**이유**:

- `upload-pages-artifact@v3`는 `.gitignore`를 존중하여 파일 제외
- `posts.json`이 `.gitignore`에 있으면 배포에서 누락 → 404 에러
- GitHub Actions가 매번 덮어쓰므로 충돌 없음

## 💬 Giscus 댓글 설정

### 1단계: GitHub Discussions 활성화

1. 저장소 **Settings** > **General** > **Features**
2. **Discussions** 체크박스 활성화

### 2단계: Giscus 앱 설치

1. https://github.com/apps/giscus 접속
2. **Install** 버튼 클릭
3. **Only select repositories** 선택
4. `{your_github_username}.github.io` 저장소 선택
5. **Install** 클릭

### 3단계: Giscus 설정 정보 가져오기

1. https://giscus.app/ko 접속
2. **저장소** 입력: `{your_github_username}/{your_github_username}.github.io`
3. 설정:
   - **페이지 ↔️ Discussions 매핑**: `pathname` (권장)
   - **Discussion 카테고리**: `General` 또는 `Announcements`
   - **기능**: 메인 포스트에 반응 남기기 활성화
   - **테마**: `preferred_color_scheme` (자동 다크/라이트 전환)
4. 생성된 코드에서 값 복사:
   - `data-repo-id`
   - `data-category-id`

### 4단계: 블로그에 설정 적용

`js/post-loader.js` 파일의 `loadGiscus()` 함수 업데이트:

```javascript
script.setAttribute(
  'data-repo',
  '{your_github_username}/{your_github_username}.github.io',
);
script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // 3단계에서 복사
script.setAttribute('data-category', 'General');
script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // 3단계에서 복사
script.setAttribute('data-emit-metadata', '1'); // 실시간 업데이트를 위해 반드시 1로 설정
```

### 5단계: 변경사항 커밋 & 푸시

```bash
git add js/post-loader.js
git commit -m "feat: Giscus 댓글 시스템 설정"
git push origin main
```

배포 후 게시글 페이지에서 댓글 시스템이 작동합니다.
