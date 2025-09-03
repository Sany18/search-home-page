const HISTORY_KEY = 'searchHistory';
const BOOKMARKS_KEY = 'bookmarks';
const EXCLUDE_RULES_KEY = 'excludeRules';
const DEFAULT_EXCLUDE_RULES = '-ru -и -ы';
const MAX_HISTORY = 100;

const elementIds = {
  content: '#content',
  // Section 1
  searchInput: '#google-search-query-input',
  searchButton: '#google-search-button',
  clearInputButton: '#google-search-clear-input-button',
  udmFormParam: '#google-search-udm-param',

  excludeRulesInput: '#exclude-rules-input',
  resetFilterButton: '#reset-filter-button',

  historyList: '#search-history-list',

  // Section 2
  bookmarksList: '#bookmarks-list',
  newBookmark: '#new-bookmark',
  newBookmarkButton: '#create-new-bookmark-button',
  newBookmarkDialog: '#create-new-bookmark-dialog'
}

document.addEventListener('DOMContentLoaded', function () {
  //////////////////////////////
  // Search input, buttons
  const queryInput = $(elementIds.searchInput);
  const searchButton = $(elementIds.searchButton);
  const udmFormParam = $(elementIds.udmFormParam);
  const clearInputButton = $(elementIds.clearInputButton);

  // Search input
  queryInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      // Add new line to textarea
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + "\n" + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
    } else if (e.key === 'Enter') {
      // Open search in new tab
      e.preventDefault();
      searchButton.click();
    }
  });

  // Search button
  const updateSearchButtonState = () => {
    searchButton.disabled = !queryInput.value.trim();
  }

  searchButton.addEventListener('click', (e) => {
    // Get fresh value
    const _excludeRulesInput = $(elementIds.excludeRulesInput);
    const excludeRulesValue = _excludeRulesInput.value.replace(/ /g, '+');
    const query = queryInput.value;
    addToHistory(query);
    const udm = udmFormParam.value;
    // Build the Google search URL with extra params
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}+${excludeRulesValue}&udm=${encodeURIComponent(udm)}`;
    window.open(searchUrl);
    queryInput.value = '';
    updateSearchButtonState();
  });

  queryInput.addEventListener('input', updateSearchButtonState);

  clearInputButton.addEventListener('click', () => {
    queryInput.value = '';
    updateSearchButtonState();
  });

  updateSearchButtonState();
  //////////////////////////////

  //////////////////////////////
  // Exclude rules
  const excludeRulesInput = $(elementIds.excludeRulesInput);

  excludeRulesInput.value = localStorage.getItem(EXCLUDE_RULES_KEY) || DEFAULT_EXCLUDE_RULES;
  excludeRulesInput.addEventListener('input', () => {
    localStorage.setItem(EXCLUDE_RULES_KEY, excludeRulesInput.value);
  });

  // Reset button
  const resetFilterButton = $(elementIds.resetFilterButton);

  resetFilterButton.addEventListener('click', () => {
    excludeRulesInput.value = DEFAULT_EXCLUDE_RULES;
    localStorage.setItem(EXCLUDE_RULES_KEY, DEFAULT_EXCLUDE_RULES);
  });
  //////////////////////////////

  //////////////////////////////
  // Search history
  const historyList = $(elementIds.historyList);

  const renderHistory = () => {
    historyList.innerHTML = '';
    const history = getHistory();
    history.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'history-item pointer';
      li.title = item;

      // Content wrapper div
      const contentDiv = document.createElement('div');
      contentDiv.className = 'history-line-content';
      contentDiv.textContent = item;
      contentDiv.onclick = () => {
        queryInput.value = item;
        updateSearchButtonState();
      };

      contentDiv.ondblclick = () => {
        searchButton.click();
      };

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.className = 'delete-btn';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        removeFromHistory(idx);
      };

      contentDiv.appendChild(delBtn);
      li.appendChild(contentDiv);
      historyList.appendChild(li);
    });
  }

  const getHistory = () => {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  }

  const saveHistory = (history) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  const addToHistory = (query) => {
    let history = getHistory();
    history = history.filter(item => item !== query);
    history.unshift(query);
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    saveHistory(history);
    renderHistory();
  }

  const removeFromHistory = (index) => {
    let history = getHistory();
    history.splice(index, 1);
    saveHistory(history);
    renderHistory();
  }

  renderHistory();
  //////////////////////////////

  //////////////////////////////
  // Bookmarks
  const bookmarksList = $(elementIds.bookmarksList);
  const newBookmarkEl = $(elementIds.newBookmark);

  const subscribeToCreateNewBookmark = () => {
    setTimeout(() => {
      const createNewBookmarkSubscriptions = () => {
        const newBookmarkDialogEl = $(elementIds.newBookmarkDialog);
        const submitFormEl = newBookmarkDialogEl.querySelector('form');

        submitFormEl.addEventListener('submit', (e) => {
          e.preventDefault();

          const payload = Array.from(e.target.querySelectorAll('input')).map(input => input.value.trim());
          const url = itHasUrlSlashes(payload[0]) ? payload[0] : `https://${payload[0]}`;
          const icon = getSiteIcon(url);
          const title = payload[1] || trimProtocol(payload[0]);
          const newBookmark = { url, title, icon };

          addBookmark(newBookmark);
          subscribeToCreateNewBookmark();
        });
      }
      
      $(elementIds.newBookmarkButton).addEventListener('click', () => {
        createNewBookmarkSubscriptions();
      });
    }, 0);
  }

  subscribeToCreateNewBookmark();

  const renderBookmarks = () => {
    bookmarksList.innerHTML = '';
    bookmarksList.innerHTML = newBookmarkEl.outerHTML;

    const bookmarks = getBookmarks();

    bookmarks.forEach((item, idx) => {
      const bookmarkCell = document.createElement('a');
      bookmarkCell.className = 'bookmark-cell';
      bookmarkCell.href = item.url;
      bookmarkCell.title = item.url;
      
      const textEl = document.createElement('div');
      textEl.className = 'bookmark-text';
      textEl.innerText = item.title || item.url;

      const iconEl = document.createElement('img');
      iconEl.className = 'bookmark-icon';
      iconEl.src = item.icon;

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.className = 'bookmark-delete-btn';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        removeFromBookmarks(idx);
      };

      if (item.icon) bookmarkCell.appendChild(iconEl);
      bookmarkCell.appendChild(textEl);
      bookmarkCell.appendChild(delBtn);
      bookmarksList.appendChild(bookmarkCell);
    });
  }

  const getBookmarks = () => {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
  }

  const saveBookmarks = (bookmarks) => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }

  const removeFromBookmarks = (index) => {
    let bookmarks = getBookmarks();
    bookmarks.splice(index, 1);
    saveBookmarks(bookmarks);
    renderBookmarks();
  }

  const addBookmark = (newBookmark) => {
    let bookmarks = getBookmarks();
    bookmarks.push(newBookmark);
    saveBookmarks(bookmarks);
    renderBookmarks();
  }

  // const editBookmark = (index, newData) => {
  //   let bookmarks = getBookmarks();
  //   bookmarks[index] = newData;
  //   saveBookmarks(bookmarks);
  //   renderBookmarks();
  // }

  const getSiteIcon = (url) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}`;
    } catch {
      return '';
    }
  }

  renderBookmarks();
  //////////////////////////////
});

//////////////////////////////
// Utils
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    document.body.style.height = `${window.visualViewport.height}px;`;
  });
}

const itHasUrlSlashes = (str) => {
  return /\/\//.test(str);
}

const trimProtocol = (url) => {
  return url.replace(/^(https?:\/\/)?(www\.)?/, '');
}
//////////////////////////////
