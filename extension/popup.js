/**
 * FocusFlow Focus Shield Popup Script.
 * Displays connection and blocking status in the Chrome toolbar action.
 */

const statusVal = document.getElementById('status-val');
const openBtn = document.getElementById('open-btn');

// Fetch values from local storage cache
chrome.storage.local.get(['shieldActive'], (result) => {
  if (result.shieldActive) {
    statusVal.textContent = 'Active';
    statusVal.className = 'status-val active';
  } else {
    statusVal.textContent = 'Inactive';
    statusVal.className = 'status-val inactive';
  }
});

// Navigate to FocusFlow dashboard
openBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://focus-flow-flame-one.vercel.app/' });
});
