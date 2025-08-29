const HISTORY_KEY = 'searchHistory';
const EXCLUDE_RULES_KEY = 'excludeRules';
const DEFAULT_EXCLUDE_RULES = '-ru -и -ы';
const MAX_HISTORY = 100;

document.addEventListener('DOMContentLoaded', function () {
  const queryInput = document.querySelector('.search-query-input');
  const searchButton = document.querySelector('.search-button');
  const historyList = document.getElementById('search-history-list');
  const clearInputButton = document.querySelector('.clear-input-button');
  const udmFormParam = document.getElementById('udm-param');
  const excludeRulesInput = document.getElementById('exclude-rules-input');
  const resetFilterButton = document.querySelector('.reset-filter-button');

  excludeRulesInput.value = localStorage.getItem(EXCLUDE_RULES_KEY) || DEFAULT_EXCLUDE_RULES;
  excludeRulesInput.addEventListener('input', () => {
    localStorage.setItem(EXCLUDE_RULES_KEY, excludeRulesInput.value);
  });

  resetFilterButton.addEventListener('click', () => {
    excludeRulesInput.value = DEFAULT_EXCLUDE_RULES;
    localStorage.setItem(EXCLUDE_RULES_KEY, DEFAULT_EXCLUDE_RULES);
  });

  // Enable/disable search button based on textarea value;
  const updateSearchButtonState = () => {
    searchButton.disabled = !queryInput.value.trim();
  }

  queryInput.addEventListener('input', updateSearchButtonState);

  // Search history logic
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
        console.log(searchButton);
        
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

      delBtn.ondblclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };

      contentDiv.appendChild(delBtn);
      li.appendChild(contentDiv);
      historyList.appendChild(li);
    });
  }

  // Search logic
  searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    const _excludeRulesInput = document.getElementById('exclude-rules-input');
    const excludeRulesValue = _excludeRulesInput.value.replace(/ /g, '+');
    const query = queryInput.value;
    addToHistory(query);
    const udm = udmFormParam.value;
    // Build the Google search URL with extra params
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}+${excludeRulesValue}&udm=${encodeURIComponent(udm)}`;
    window.open(searchUrl, '_blank');
    queryInput.value = '';
    updateSearchButtonState();
  });

  clearInputButton.addEventListener('click', () => {
    queryInput.value = '';
    updateSearchButtonState();
  });

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

  renderHistory();
  updateSearchButtonState();
});
