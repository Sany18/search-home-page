const HISTORY_KEY = 'searchHistory';
const EXCLUDE_RULES_KEY = 'excludeRules';
const DEFAULT_EXCLUDE_RULES = '-ru -и -ы';
const MAX_HISTORY = 100;

document.addEventListener('DOMContentLoaded', function () {
  const excludeRulesInput = document.getElementById('exclude-rules');
  excludeRulesInput.value = localStorage.getItem(EXCLUDE_RULES_KEY) || DEFAULT_EXCLUDE_RULES;
  excludeRulesInput.addEventListener('input', function () {
    localStorage.setItem(EXCLUDE_RULES_KEY, excludeRulesInput.value);
  });
  
  // Enable/disable search button based on textarea value
  const searchButton = document.querySelector('.search-button');
  const searchQuery = document.querySelector('.search-query');
  function updateSearchButtonState() {
    searchButton.disabled = !searchQuery.value.trim();
  }
  updateSearchButtonState();
  searchQuery.addEventListener('input', updateSearchButtonState);

  // Search history logic
  function getHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  }

  function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function addToHistory(query) {
    let history = getHistory();
    history = history.filter(item => item !== query);
    history.unshift(query);
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    saveHistory(history);
    renderHistory();
  }

  function removeFromHistory(index) {
    let history = getHistory();
    history.splice(index, 1);
    saveHistory(history);
    renderHistory();
  }

  function renderHistory() {
    const list = document.getElementById('search-history-list');
    list.innerHTML = '';
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
        document.querySelector('.search-query').value = item;
        updateSearchButtonState();
      };

      contentDiv.ondblclick = () => {
        document.querySelector('.search-button').click();
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
      list.appendChild(li);
    });
  }

  // Show delete button only on hover
  renderHistory();

  // Search logic
  document.querySelector('.search-button').addEventListener('click', (e) => {
    e.preventDefault();
    const queryInput = document.querySelector('.search-query');
    const excludeRulesInput = document.getElementById('exclude-rules').value.replace(/ /g, '+');
    const query = queryInput.value;
    addToHistory(query);
    const udm = document.getElementById('udm-param').value;
    // Build the Google search URL with extra params
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}+${excludeRulesInput}&udm=${encodeURIComponent(udm)}`;
    window.open(searchUrl, '_blank');
    queryInput.value = '';
    updateSearchButtonState();
  });

  document.querySelector('.clear-input').addEventListener('click', (e) => {
    document.querySelector('.search-query').value = '';
    updateSearchButtonState();
  });

  document.querySelector('.search-query').addEventListener('keydown', function (e) {
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
      document.querySelector('.search-button').click();
    }
  });
});
