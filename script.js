const chatContent = document.getElementById("chat-content");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

const chatGPTLogo = "https://i.ibb.co/JxcxBzh/67373267.jpg";
const userLogo = "https://i.ibb.co/ssQNvBC/67373290.jpg";

// Function to parse markdown
function parseMarkdown(text) {
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/\n/g, '<br/>');
    return text;
}

// Create message element
function createMessageElement(message, fromUser, isLoading = false) {
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message", fromUser ? "user" : "bot");

    const avatar = document.createElement("img");
    avatar.src = fromUser ? userLogo : chatGPTLogo;
    avatar.alt = fromUser ? "User" : "ChatGPT";
    avatar.classList.add("avatar");

    const bubble = document.createElement("div");
    if (isLoading) {
        bubble.classList.add("loading");
        bubble.innerHTML = `<div class="dots">
                                <div class="dot"></div>
                                <div class="dot"></div>
                                <div class="dot"></div>
                            </div>`;
    } else {
        bubble.classList.add("bubble");
        bubble.innerHTML = parseMarkdown(message);
    }

    messageWrapper.appendChild(fromUser ? bubble : avatar);
    messageWrapper.appendChild(fromUser ? avatar : bubble);

    return messageWrapper;
}

// Fetch AI response
async function fetchResponse(userMessage) {
    try {
        const response = await fetch("https://backend.buildpicoapps.com/aero/run/llm-api?pk=API_KEY", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: userMessage })
        });

        if (!response.ok) return "Error. Please try again.";

        const data = await response.json();
        return data.status === "success" ? data.text : "Error.";
    } catch {
        return "Error.";
    }
}

// Store and load chat history
function storeChatHistory() {
    const messages = [];
    document.querySelectorAll(".message").forEach(msg => {
        messages.push({ message: msg.querySelector(".bubble").innerHTML, fromUser: msg.classList.contains("user") });
    });
    localStorage.setItem("chatHistory", JSON.stringify(messages));
}

function loadChatHistory() {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory"));
    if (chatHistory) chatHistory.forEach(msg => chatContent.appendChild(createMessageElement(msg.message, msg.fromUser)));
}

function clearHistory() {
    localStorage.removeItem("chatHistory");
    chatContent.innerHTML = "";
    alert("Chat history cleared!");
}

// Handle message submission
chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const userMessage = userInput.value.trim();
    if (!userMessage) return;
    chatContent.appendChild(createMessageElement(userMessage, true));
    userInput.value = "";

    const loadingMessage = createMessageElement("", false, true);
    chatContent.appendChild(loadingMessage);

    const botResponse = await fetchResponse(userMessage);
    chatContent.removeChild(loadingMessage);
    chatContent.appendChild(createMessageElement(botResponse, false));

    storeChatHistory();
});

window.addEventListener('load', loadChatHistory);
