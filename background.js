chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToGPT",
    title: "Ask",
    contexts: ["selection"],
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendDataToAPI") {
    sendDataToAPI(request.selectedText, request.question)
      .then(response => sendResponse({ message: response }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Indicates you wish to send a response asynchronously.
  }
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToGPT") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: createFloatingInput,
      args: [info.selectionText, tab.id]  // Pass the tab.id as an argument
    });
  }
});

const sendDataToAPI = async (selectedText, question) => {
  //post request with body text as selectedText and question as question to http://localhost:4000/api/snippets/ask
  try {
    const response = await fetch('https://api.lazyweb.rocks/api/snippets/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: selectedText, question })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.message
  } catch (error) {
    console.error('Error:', error);
  }
  finally {
    console.log('finally')
  }
}

function createFloatingInput(selectedText, tabId) {
  const input = document.createElement("input");
  input.id = "gptInputBox";

  let x = 0, y = 0;
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    x = rect.left + window.scrollX;
    y = rect.top + window.scrollY;
  }

  // Position and size
  input.style.position = 'fixed';
  input.style.top = `${y - input.offsetHeight - 50}px`;
  input.style.left = `${x}px`;
  input.style.zIndex = '1000';

  // Styling for modern dark theme
  input.style.border = '2px solid #333'; // Darker border
  input.style.backgroundColor = '#222'; // Dark background
  input.style.color = '#fff'; // Light text color for contrast
  input.style.borderRadius = '15px'; // More rounded corners
  input.style.padding = '10px 15px 10px 35px'; // Adjust padding for aesthetics
  input.style.fontSize = '16px'; // Larger font size for modern look
  input.style.outline = 'none'; // Remove outline to enhance modern feel
  input.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)'; // Subtle shadow for depth


  // Adding an image at the start of the input
  input.style.backgroundImage = 'url("https://cdn.jsdelivr.net/gh/dishant0406/images-repo@master/48.png")';
  input.style.backgroundRepeat = 'no-repeat';
  input.style.backgroundSize = '20px 20px'; // Adjust as needed
  input.style.backgroundPosition = '10px center'; // Adjust as needed

  // Adding the element and focusing
  document.body.appendChild(input);
  input.focus();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.body.style.cursor = "wait";
      chrome.runtime.sendMessage({
        action: "sendDataToAPI",
        selectedText: selectedText,
        question: input.value
      }, (response) => {
        document.body.style.cursor = "default";
        if (response.error) {
          console.error('Error:', response.error);
        } else {
          navigator.clipboard.writeText(response.message);
        }
      });
      input.remove();
    }
    if (e.key === "Escape") {
      input.remove();
    }
  });
}





