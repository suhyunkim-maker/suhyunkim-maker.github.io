document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const file = urlParams.get('file');
  
  if (file) {
    loadPost(file);
  } else {
    document.getElementById('post-content').innerHTML = '<h1>게시글을 찾을 수 없습니다.</h1>';
  }
});

async function loadPost(filename) {
  try {
    const response = await fetch(`pages/${filename}`);
    if (!response.ok) throw new Error('Post not found');
    
    let content = await response.text();
    
    // Remove BOM
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    
    // Parse Front Matter
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    let markdownContent = content;
    
    if (match) {
      markdownContent = match[2];
    }
    
    // Convert Markdown to HTML
    if (typeof marked !== 'undefined') {
      const htmlContent = marked.parse(markdownContent);
      document.getElementById('post-content').innerHTML = htmlContent;
      
      // Syntax Highlighting
      if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
      }
    }
    
    loadGiscus();
    
  } catch (error) {
    console.error('Error loading post:', error);
    document.getElementById('post-content').innerHTML = '<h1>게시글을 불러올 수 없습니다.</h1>';
  }
}

function loadGiscus() {
  const container = document.querySelector('.giscus-container');
  if (!container) return;
  
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  
  script.setAttribute('data-repo', 'suhyunkim-maker/suhyunkim-maker.github.io');
  script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // Change this!
  script.setAttribute('data-category', 'General');
  script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // Change this!
  script.setAttribute('data-mapping', 'pathname');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '1');
  script.setAttribute('data-input-position', 'bottom');
  script.setAttribute('data-theme', 'preferred_color_scheme');
  script.setAttribute('data-lang', 'ko');
  script.crossOrigin = 'anonymous';
  script.async = true;
  
  container.appendChild(script);
}
