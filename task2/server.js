const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

console.log('🤖 AI Chat Server Starting...');

// AI responses
const AI_RESPONSES = {
    greetings: [
        "👋 Hello! I'm Robo, your AI friend! How are you today?",
        "🤖 Hi there! I'm Robo, ready to chat with you!",
        "✨ Welcome! I'm Robo, your AI assistant. Let's chat!"
    ]
};

io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);
    
    socket.emit('connected', { message: 'Connected to AI chat!' });
    
    // User joins
    socket.on('user_join', (data) => {
        const username = data.username || 'Guest';
        console.log(`👤 ${username} joined`);
        
        // Welcome from AI
        setTimeout(() => {
            const greeting = AI_RESPONSES.greetings[Math.floor(Math.random() * AI_RESPONSES.greetings.length)];
            socket.emit('receive_message', {
                userId: 'ai-robot',
                username: 'Robo 🤖',
                text: greeting,
                type: 'ai'
            });
        }, 500);
    });
    
    // User sends message
    socket.on('send_message_to_ai', (data) => {
        console.log('💬 Message:', data.text);
        
        // Echo user message
        socket.emit('receive_message', {
            userId: socket.id,
            username: 'You',
            text: data.text,
            type: 'user'
        });
        
        // Show AI typing
        socket.emit('ai_typing_start');
        
        // AI response
        setTimeout(() => {
            socket.emit('ai_typing_stop');
            
            const responses = [
                `Interesting! Tell me more about "${data.text}"`,
                `I understand. What do you think about that?`,
                `Great point! I'd love to hear more.`
            ];
            
            const aiResponse = responses[Math.floor(Math.random() * responses.length)];
            
            socket.emit('receive_message', {
                userId: 'ai-robot',
                username: 'Robo 🤖',
                text: aiResponse,
                type: 'ai'
            });
        }, 1000);
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI Chat Server is running' });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📡 WebSocket: ws://localhost:${PORT}`);
});