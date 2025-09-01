const HISTORY_KEY = 'searchHistory';
const EXCLUDE_RULES_KEY = 'excludeRules';
const DEFAULT_EXCLUDE_RULES = '-ru -и -ы';
const MAX_HISTORY = 100;

const elementNames = {
  searchInput: '#google-search-query-input',
  searchButton: '#google-search-button',
  clearInputButton: '#google-search-clear-input-button',
  udmFormParam: '#google-search-udm-param',

  excludeRulesInput: '#exclude-rules-input',
  resetFilterButton: '#reset-filter-button',
  
  historyList: '#search-history-list'
}

document.addEventListener('DOMContentLoaded', function () {
  //////////////////////////////
  // Search input, buttons
  const queryInput = document.querySelector(elementNames.searchInput);
  const searchButton = document.querySelector(elementNames.searchButton);
  const udmFormParam = document.querySelector(elementNames.udmFormParam);
  const clearInputButton = document.querySelector(elementNames.clearInputButton);

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
    const _excludeRulesInput = document.querySelector(elementNames.excludeRulesInput);
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

  queryInput.addEventListener('input', updateSearchButtonState);

  clearInputButton.addEventListener('click', () => {
    queryInput.value = '';
    updateSearchButtonState();
  });

  updateSearchButtonState();
  //////////////////////////////
  
  //////////////////////////////
  // Exclude rules
  const excludeRulesInput = document.querySelector(elementNames.excludeRulesInput);

  excludeRulesInput.value = localStorage.getItem(EXCLUDE_RULES_KEY) || DEFAULT_EXCLUDE_RULES;
  excludeRulesInput.addEventListener('input', () => {
    localStorage.setItem(EXCLUDE_RULES_KEY, excludeRulesInput.value);
  });

  // Reset button
  const resetFilterButton = document.querySelector(elementNames.resetFilterButton);

  resetFilterButton.addEventListener('click', () => {
    excludeRulesInput.value = DEFAULT_EXCLUDE_RULES;
    localStorage.setItem(EXCLUDE_RULES_KEY, DEFAULT_EXCLUDE_RULES);
  });
  //////////////////////////////

  //////////////////////////////
  // Search history
  const historyList = document.querySelector(elementNames.historyList);

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

      delBtn.ondblclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
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
});
