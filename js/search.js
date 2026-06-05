let allPostsForSearch = [];

function initializeSearch(posts) {
  allPostsForSearch = posts;
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allPostsForSearch.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
      if (typeof renderPosts === "function") {
        renderPosts(filtered);
      }
    });
  }
}
