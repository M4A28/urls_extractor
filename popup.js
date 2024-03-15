// popup.js
let urls = {};

function parseUrls(url) {
    let mainDomain = (new URL(url)).hostname;
  
    return fetch(url)
      .then(response => response.text())
      .then(html => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');
        let links = Array.from(doc.querySelectorAll('a[href], img[src], link[href]')).map(el => el.href || el.src);
        
        // Filter out URLs that don't start with "http", "https", or "www"
        links = links.filter(link => link.startsWith('http') || link.startsWith('https') || link.startsWith('www'));
  
        links = [...new Set(links)]; // Remove duplicates
  
        // Group by main domain
        let urlGroups = {};
        links.forEach(link => {
          let domain = (new URL(link)).hostname;
          if (!urlGroups[domain]) {
            urlGroups[domain] = [];
          }
          urlGroups[domain].push(link);
        });
        return urlGroups;
      });
  }
  

function createTabWithContent(content, contentType) {
  let data;
  if (contentType === 'html') {
    data = '<html><body>';
    for (const domain in content) {
    
      data += `<h2 style="color:blue">${domain}</h2>`;
      data += `<div style="border:1px solid black; margin:10px; padding:10px">`;
      content[domain].forEach(url => {
        // data += `<li><i class="bi bi-chevron-right"></i> <strong>${url} </strong></li>`
        data += `<div margin:12px; padding:12px">${url} </div>`;
      });
      data += `</div>`;
    }
    data += '</body></html>';
  } else {
    data = contentType === 'json' ? JSON.stringify(content, null, 2) : Object.entries(content).map(([domain, urls]) => `${domain}\n${urls.join('\n')}`).join('\n\n');
  }
  let url = `data:text/${contentType},${encodeURIComponent(data)}`;
  chrome.tabs.create({ url: url });
}

document.getElementById('extract').addEventListener('click', function() {
  let url = document.getElementById('url').value;
  if (!url) {
    alert('Please enter a URL.');
    return;
  }
  parseUrls(url).then(result => {
    urls = result;
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'URL Extraction Complete',
      message: 'The URLs have been successfully extracted and parsed.'
    });
  });
});

document.getElementById('json').addEventListener('click', function() {
  createTabWithContent(urls, 'json');
});

// document.getElementById('txt').addEventListener('click', function() {
//   createTabWithContent(urls, 'plain');
// });

// Add a new button for HTML
document.getElementById('html').addEventListener('click', function() {
  createTabWithContent(urls, 'html');
});

// Get the current tab URL when the popup is opened
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  document.getElementById('url').value = tabs[0].url;
});
