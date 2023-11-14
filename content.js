chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "createInput") {

  }
});

async function sendDataToAPI(selectedText, question) {
  try {
    console.log('selectedText', selectedText)
    console.log('question', question)
    return
    const response = await fetch('https://api.lazyweb.rocks/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedText, question })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    navigator.clipboard.writeText(data.answer);
  } catch (error) {
    console.error('Error:', error);
  }
}
