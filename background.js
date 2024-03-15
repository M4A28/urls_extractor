chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript({
    code: 'Array.from(document.querySelectorAll("a")).map(a => a.href);'
  }, function(results) {
    // results is an array of arrays (one per frame in the tab)
    let urls = [].concat.apply([], results);
    let json = JSON.stringify(urls, null, 2); // Convert URLs to formatted JSON
    let url = 'data:application/json,' + encodeURIComponent(json); // Create data URL

    // Open new tab with JSON data
    chrome.tabs.create({ url: url });
  });
});
