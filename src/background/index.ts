// Service worker for the extension
console.log("Job Autofill background service worker started.");

// We could listen for commands or manage state if needed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Job Autofill extension installed.");
});
