class AIChatApplication {
    constructor() {
        this.socket = null;
        this.currentUser = null;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.loginScreen = document.getElementById('loginScreen');
        this.chatScreen = document.getElementById('chatScreen');
        this.usernameInput = document.getElementById('username');
        this.joinButton = document.getElementById('joinChat');
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendMessage');
        this.aiTypingIndicator = document.getElementById('aiTypingIndicator');
    }

    setupEventListeners() {
        this.joinButton.addEventListener('click', () => this.joinChat());
        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinChat();
        });

        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        this.sendButton.addEventListener('click', () => this.sendMessage());
    }

    joinChat() {
        const username = this.usernameInput.value.trim();
        
        if (!username) {
            alert('Please enter your name');
            return;
        }

        this.currentUser = username;
        this.connectToServer();
    }

    connectToServer() {
        // Connect to backend
        this.socket = io('http://localhost:3000');
        
        this.socket.on('connect', () => {
            console.log('✅ Connected to server');
            this.showChatScreen();
            this.socket.emit('user_join', { username: this.currentUser });
        });

        this.socket.on('receive_message', (message) => {
            this.displayMessage(message);
        });

        this.socket.on('ai_typing_start', () => {
            this.showAITyping(true);
        });

        this.socket.on('ai_typing_stop', () => {
            this.showAITyping(false);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            alert('Cannot connect to server. Make sure backend is running!');
        });
    }

    showChatScreen() {
        this.loginScreen.classList.remove('active');
        this.chatScreen.classList.add('active');
        this.messageInput.disabled = false;
        this.sendButton.disabled = false;
        this.messageInput.focus();
    }

    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;
        
        this.socket.emit('send_message_to_ai', { text });
        this.messageInput.value = '';
    }

    showAITyping(isTyping) {
        if (isTyping) {
            this.aiTypingIndicator.innerHTML = '🤖 Robo is typing...';
        } else {
            this.aiTypingIndicator.innerHTML = '';
        }
    }

    displayMessage(message) {
        const div = document.createElement('div');
        div.className = `message ${message.type === 'ai' ? 'ai-message' : 'user-message'}`;
        div.innerHTML = `<strong>${message.username}:</strong> ${message.text}`;
        this.messagesContainer.appendChild(div);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new AIChatApplication();
});