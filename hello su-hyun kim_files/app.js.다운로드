document.addEventListener('DOMContentLoaded', () => {
  fetchPosts();
});

let globalPosts = [];
let activeTag = null;

async function fetchPosts() {
  try {
    const response = await fetch('posts.json');
    if (!response.ok) throw new Error('Failed to fetch posts');
    globalPosts = await response.json();
    
    renderPosts(globalPosts);
    renderTags(globalPosts);
    
    if (typeof initializeSearch === 'function') {
      initializeSearch(globalPosts);
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    const postList = document.getElementById('post-list');
    if (postList) {
        postList.innerHTML = '<p>게시글을 불러오는 중 오류가 발생했습니다. (빌드가 완료되면 정상적으로 보입니다.)</p>';
    }
  }
}

function renderPosts(posts) {
  const postList = document.getElementById('post-list');
  if (!postList) return;
  
  postList.innerHTML = '';
  
  if (posts.length === 0) {
    postList.innerHTML = '<p>게시글이 없습니다.</p>';
    return;
  }

  posts.forEach(post => {
    const postEl = document.createElement('article');
    postEl.className = 'post-item';
    
    const tagsHtml = post.tags.map(tag => `<span>#${tag}</span>`).join('');
    
    postEl.innerHTML = `
      <h2><a href="post.html?file=${encodeURIComponent(post.file)}">${post.title}</a></h2>
      <div class="post-meta">${post.date} ${post.category ? `| ${post.category}` : ''}</div>
      <div class="post-excerpt">${post.excerpt}</div>
      <div class="post-tags">${tagsHtml}</div>
    `;
    
    postList.appendChild(postEl);
  });
}

function renderTags(posts) {
  const tagsContainer = document.getElementById('tag-filters');
  if (!tagsContainer) return;
  
  const allTags = new Set();
  posts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => allTags.add(tag));
    }
  });
  
  tagsContainer.innerHTML = '';
  
  const allLi = document.createElement('li');
  allLi.textContent = 'All';
  allLi.className = 'active';
  allLi.addEventListener('click', () => filterByTag(null, allLi));
  tagsContainer.appendChild(allLi);

  allTags.forEach(tag => {
    const li = document.createElement('li');
    li.textContent = tag;
    li.addEventListener('click', () => filterByTag(tag, li));
    tagsContainer.appendChild(li);
  });
}

function filterByTag(tag, element) {
  const tagsContainer = document.getElementById('tag-filters');
  Array.from(tagsContainer.children).forEach(child => child.classList.remove('active'));
  element.classList.add('active');
  
  if (tag === null) {
    renderPosts(globalPosts);
  } else {
    const filtered = globalPosts.filter(post => post.tags && post.tags.includes(tag));
    renderPosts(filtered);
  }
}
