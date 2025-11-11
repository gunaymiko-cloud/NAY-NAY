class NayNayChat {
    constructor() {
        this.currentUser = {
            id: 1,
            username: 'Вы',
            avatar: '👤',
            status: 'online'
        };
        
        this.chats = [
            {
                id: 1,
                name: 'Общий чат',
                avatar: '👥',
                type: 'group',
                participants: [],
                lastMessage: 'Добро пожаловать в общий чат!',
                lastMessageTime: '12:00',
                unread: 0,
                online: true
            }
        ];
        
        this.friends = [
            {
                id: 2,
                username: 'Алексей',
                avatar: '😎',
                status: 'online',
                lastSeen: 'только что',
                isFriend: true
            },
            {
                id: 3,
                username: 'Мария',
                avatar: '👩',
                status: 'away',
                lastSeen: '10 минут назад',
                isFriend: true
            },
            {
                id: 4,
                username: 'Дмитрий',
                avatar: '🧑‍💻',
                status: 'offline',
                lastSeen: '2 часа назад',
                isFriend: true
            }
        ];
        
        this.friendRequests = [
            {
                id: 5,
                username: 'Екатерина',
                avatar: '👸',
                message: 'Привет! Давай дружить!',
                timestamp: '10:30'
            }
        ];
        
        this.messages = {
            1: [ // Общий чат
                {
                    id: 1,
                    senderId: 0,
                    senderName: 'Система',
                    avatar: '🤖',
                    text: 'Добро пожаловать в общий чат! 🎉',
                    time: '12:00',
                    type: 'text'
                }
            ]
        };
        
        this.currentChatId = null;
        
        this.initializeElements();
        this.initEventListeners();
        this.renderChats();
        this.renderFriends();
        this.renderFriendRequests();
    }
    
    initializeElements() {
        // Основные элементы
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.emojiButton = document.getElementById('emojiButton');
        this.emojiPicker = document.getElementById('emojiPicker');
        this.fileButton = document.getElementById('fileButton');
        this.voiceButton = document.getElementById('voiceButton');
        this.voiceRecordIndicator = document.getElementById('voiceRecordIndicator');
        
        // Модальные окна
        this.fileModal = document.getElementById('fileModal');
        this.addFriendModal = document.getElementById('addFriendModal');
        this.userInfoModal = document.getElementById('userInfoModal');
        
        // Элементы чата
        this.currentChatAvatar = document.getElementById('currentChatAvatar');
        this.currentChatName = document.getElementById('currentChatName');
        this.currentChatStatus = document.getElementById('currentChatStatus');
        
        // Списки
        this.chatsList = document.getElementById('chatsList');
        this.friendsList = document.getElementById('friendsList');
        this.requestsList = document.getElementById('requestsList');
        
        // Кнопки
        this.addFriendBtn = document.getElementById('addFriendBtn');
        this.sendFilesButton = document.getElementById('sendFilesButton');
        this.sendFriendRequest = document.getElementById('sendFriendRequest');
        
        this.selectedFiles = [];
        this.isRecording = false;
        this.recordingTime = 0;
        this.recordingTimer = null;
    }
    
    initEventListeners() {
        // Отправка сообщений
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Эмодзи
        this.emojiButton.addEventListener('click', () => this.toggleEmojiPicker());
        document.addEventListener('click', (e) => {
            if (!this.emojiPicker.contains(e.target) && e.target !== this.emojiButton) {
                this.emojiPicker.classList.remove('show');
            }
        });
        
        // Файлы
        this.fileButton.addEventListener('click', () => this.openFileModal());
        this.fileModal.querySelector('.close').addEventListener('click', () => this.closeFileModal());
        this.sendFilesButton.addEventListener('click', () => this.sendFiles());
        
        // Голосовые сообщения
        this.voiceButton.addEventListener('click', () => this.toggleVoiceRecording());
        this.voiceRecordIndicator.addEventListener('click', () => this.stopVoiceRecording());
        
        // Друзья
        this.addFriendBtn.addEventListener('click', () => this.openAddFriendModal());
        this.addFriendModal.querySelector('.close').addEventListener('click', () => this.closeAddFriendModal());
        this.sendFriendRequest.addEventListener('click', () => this.sendFriendRequestHandler());
        
        // Вкладки
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Закрытие модальных окон
        window.addEventListener('click', (e) => {
            if (e.target === this.fileModal) this.closeFileModal();
            if (e.target === this.addFriendModal) this.closeAddFriendModal();
            if (e.target === this.userInfoModal) this.closeUserInfoModal();
        });
        
        // Инициализация эмодзи
        document.querySelectorAll('.emoji').forEach(emoji => {
            emoji.addEventListener('click', () => {
                if (this.messageInput.disabled) return;
                this.messageInput.value += emoji.textContent;
                this.messageInput.focus();
            });
        });
    }
    
    // Вкладки
    switchTab(tabName) {
        // Обновляем активные кнопки вкладок
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Обновляем активный контент
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }
    
    // Рендер списков
    renderChats() {
        this.chatsList.innerHTML = '';
        this.chats.forEach(chat => {
            const chatElement = this.createChatElement(chat);
            this.chatsList.appendChild(chatElement);
        });
    }
    
    renderFriends() {
        this.friendsList.innerHTML = '';
        this.friends.forEach(friend => {
            const friendElement = this.createFriendElement(friend);
            this.friendsList.appendChild(friendElement);
        });
    }
    
    renderFriendRequests() {
        this.requestsList.innerHTML = '';
        if (this.friendRequests.length === 0) {
            this.requestsList.innerHTML = '<div class="no-requests">Нет новых запросов в друзья</div>';
            return;
        }
        
        this.friendRequests.forEach(request => {
            const requestElement = this.createFriendRequestElement(request);
            this.requestsList.appendChild(requestElement);
        });
    }
    
    createChatElement(chat) {
        const div = document.createElement('div');
        div.className = `contact ${this.currentChatId === chat.id ? 'active' : ''}`;
        div.innerHTML = `
            <div class="contact-avatar avatar-with-status ${chat.online ? 'status-online' : 'status-offline'}">
                ${chat.avatar}
                <div class="status-indicator"></div>
            </div>
            <div class="contact-info">
                <div class="contact-name">${chat.name}</div>
                <div class="last-message">${chat.lastMessage}</div>
            </div>
            <div class="contact-time">
                <div class="time">${chat.lastMessageTime}</div>
                ${chat.unread > 0 ? `<div class="notification-badge">${chat.unread}</div>` : ''}
            </div>
        `;
        
        div.addEventListener('click', () => this.selectChat(chat.id));
        return div;
    }
    
    createFriendElement(friend) {
        const div = document.createElement('div');
        div.className = `contact avatar-with-status status-${friend.status}`;
        div.innerHTML = `
            <div class="contact-avatar">
                ${friend.avatar}
                <div class="status-indicator"></div>
            </div>
            <div class="contact-info">
                <div class="contact-name">${friend.username}</div>
                <div class="last-message">${this.getStatusText(friend)}</div>
            </div>
            <div class="contact-actions">
                <button class="contact-action-btn info-btn" title="Информация">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                </button>
                <button class="contact-action-btn" title="Написать сообщение">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Обработчики для кнопок действий
        const messageBtn = div.querySelector('.contact-action-btn:last-child');
        const infoBtn = div.querySelector('.info-btn');
        
        messageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startChatWithFriend(friend);
        });
        
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showUserInfo(friend);
        });
        
        return div;
    }
    
    createFriendRequestElement(request) {
        const div = document.createElement('div');
        div.className = 'friend-request';
        div.innerHTML = `
            <div class="contact-avatar">${request.avatar}</div>
            <div class="request-info">
                <div class="request-name">${request.username}</div>
                <div class="request-message">${request.message}</div>
                <div class="request-actions">
                    <button class="request-btn accept-request">Принять</button>
                    <button class="request-btn decline-request">Отклонить</button>
                </div>
            </div>
            <div class="time">${request.timestamp}</div>
        `;
        
        const acceptBtn = div.querySelector('.accept-request');
        const declineBtn = div.querySelector('.decline-request');
        
        acceptBtn.addEventListener('click', () => this.acceptFriendRequest(request.id));
        declineBtn.addEventListener('click', () => this.declineFriendRequest(request.id));
        
        return div;
    }
    
    getStatusText(friend) {
        switch (friend.status) {
            case 'online': return 'в сети';
            case 'away': return 'не активен';
            case 'offline': return `был(а) ${friend.lastSeen}`;
            default: return '';
        }
    }
    
    // Работа с чатами
    selectChat(chatId) {
        this.currentChatId = chatId;
        const chat = this.chats.find(c => c.id === chatId);
        
        if (!chat) return;
        
        // Обновляем UI
        this.currentChatAvatar.textContent = chat.avatar;
        this.currentChatName.textContent = chat.name;
        this.currentChatStatus.textContent = chat.type === 'group' ? 'групповой чат' : 'в сети';
        
        // Активируем поле ввода
        this.messageInput.disabled = false;
        this.messageInput.placeholder = 'Введите сообщение...';
        this.sendButton.disabled = false;
        this.voiceButton.disabled = false;
        
        // Показываем сообщения
        this.renderMessages(chatId);
        
        // Обновляем активный чат в списке
        this.renderChats();
    }
    
    startChatWithFriend(friend) {
        // Ищем существующий чат с другом
        let chat = this.chats.find(c => 
            c.type === 'private' && c.participants && c.participants.includes(friend.id)
        );
        
        if (!chat) {
            // Создаем новый чат
            chat = {
                id: Date.now(),
                name: friend.username,
                avatar: friend.avatar,
                type: 'private',
                participants: [this.currentUser.id, friend.id],
                lastMessage: 'Чат создан',
                lastMessageTime: this.getCurrentTime(),
                unread: 0,
                online: friend.status === 'online'
            };
            
            this.chats.push(chat);
            this.messages[chat.id] = [{
                id: Date.now(),
                senderId: 0,
                senderName: 'Система',
                avatar: '🤖',
                text: `Чат с ${friend.username} создан! Начните общение.`,
                time: this.getCurrentTime(),
                type: 'text'
            }];
            this.renderChats();
        }
        
        this.selectChat(chat.id);
        this.switchTab('chats');
    }
    
    renderMessages(chatId) {
        this.messagesContainer.innerHTML = '';
        const messages = this.messages[chatId] || [];
        
        if (messages.length === 0) {
            this.messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">💬</div>
                    <h3>Начните общение!</h3>
                    <p>Это начало вашей беседы</p>
                </div>
            `;
            return;
        }
        
        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            this.messagesContainer.appendChild(messageElement);
        });
        
        this.scrollToBottom();
    }
    
    createMessageElement(message) {
        const isCurrentUser = message.senderId === this.currentUser.id;
        const div = document.createElement('div');
        div.className = `message ${isCurrentUser ? 'user-message' : 'bot-message'}`;
        
        div.innerHTML = `
            <div class="message-avatar">${message.avatar}</div>
            <div class="message-content">
                ${!isCurrentUser ? `<div class="sender-name">${message.senderName}</div>` : ''}
                <div class="message-text">${message.text}</div>
                ${message.files ? this.createFileMessage(message.files) : ''}
                ${message.audio ? this.createAudioMessage(message.audio) : ''}
                <div class="message-time">${message.time}</div>
            </div>
        `;
        
        return div;
    }

    createFileMessage(files) {
        if (!files || !Array.isArray(files)) return '';
        return files.map(file => `
            <div class="file-message">
                <div class="file-icon">${this.getFileIcon(file.type)}</div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
            </div>
        `).join('');
    }

    createAudioMessage(audio) {
        return `
            <div class="audio-message">
                <div class="file-icon">🎵</div>
                <div class="audio-player">
                    <div class="audio-controls">
                        <button class="play-btn">▶</button>
                        <div class="audio-duration">${audio.duration}</div>
                    </div>
                </div>
            </div>
        `;
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.startsWith('audio/')) return '🎵';
        if (fileType.startsWith('video/')) return '🎬';
        return '📄';
    }
    
    sendMessage() {
        if (!this.currentChatId) return;
        
        const messageText = this.messageInput.value.trim();
        if (messageText === '') return;
        
        const message = {
            id: Date.now(),
            senderId: this.currentUser.id,
            senderName: this.currentUser.username,
            avatar: this.currentUser.avatar,
            text: messageText,
            time: this.getCurrentTime(),
            type: 'text'
        };
        
        this.addMessageToChat(message);
        this.messageInput.value = '';
        
        // Имитация ответа
        if (this.currentChatId === 1) { // Только в общем чате
            setTimeout(() => {
                this.addBotResponse(messageText);
            }, 1000);
        }
    }
    
    addMessageToChat(message) {
        if (!this.messages[this.currentChatId]) {
            this.messages[this.currentChatId] = [];
        }
        
        this.messages[this.currentChatId].push(message);
        
        // Обновляем последнее сообщение в чате
        const chat = this.chats.find(c => c.id === this.currentChatId);
        if (chat) {
            chat.lastMessage = message.text.length > 30 ? message.text.substring(0, 30) + '...' : message.text;
            chat.lastMessageTime = message.time;
            this.renderChats();
        }
        
        this.renderMessages(this.currentChatId);
    }
    
    addBotResponse(userMessage) {
        if (!this.currentChatId) return;
        
        const responses = [
            "Интересное сообщение! 🤔",
            "Спасибо за ваше сообщение! 😊",
            "Я пока учусь общаться... 📚",
            "Отличная мысль! 💡",
            "Продолжайте в том же духе! 🚀",
            "Как я могу вам помочь? ❓"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const botMessage = {
            id: Date.now(),
            senderId: 0,
            senderName: 'Бот',
            avatar: '🤖',
            text: randomResponse,
            time: this.getCurrentTime(),
            type: 'text'
        };
        
        this.addMessageToChat(botMessage);
    }
    
    // Друзья и запросы
    openAddFriendModal() {
        this.addFriendModal.classList.add('show');
    }
    
    closeAddFriendModal() {
        this.addFriendModal.classList.remove('show');
    }
    
    sendFriendRequestHandler() {
        const usernameInput = document.getElementById('friendUsername');
        const messageInput = document.getElementById('friendMessage');
        
        const username = usernameInput.value.trim();
        const message = messageInput.value.trim();
        
        if (!username) {
            alert('Введите имя пользователя');
            return;
        }
        
        // Имитация отправки запроса
        const newRequest = {
            id: Date.now(),
            username: username,
            avatar: '👤',
            message: message || 'Хочу добавить вас в друзья!',
            timestamp: this.getCurrentTime()
        };
        
        this.friendRequests.push(newRequest);
        this.renderFriendRequests();
        
        // Очищаем поля
        usernameInput.value = '';
        messageInput.value = '';
        this.closeAddFriendModal();
        
        alert(`Запрос в друзья отправлен пользователю ${username}`);
    }
    
    acceptFriendRequest(requestId) {
        const requestIndex = this.friendRequests.findIndex(req => req.id === requestId);
        if (requestIndex === -1) return;
        
        const request = this.friendRequests[requestIndex];
        
        // Добавляем в друзья
        const newFriend = {
            id: request.id,
            username: request.username,
            avatar: request.avatar,
            status: 'online',
            lastSeen: 'только что',
            isFriend: true
        };
        
        this.friends.push(newFriend);
        this.friendRequests.splice(requestIndex, 1);
        
        this.renderFriends();
        this.renderFriendRequests();
        
        alert(`Теперь вы дружите с ${request.username}!`);
    }
    
    declineFriendRequest(requestId) {
        const requestIndex = this.friendRequests.findIndex(req => req.id === requestId);
        if (requestIndex === -1) return;
        
        const request = this.friendRequests[requestIndex];
        this.friendRequests.splice(requestIndex, 1);
        
        this.renderFriendRequests();
        alert(`Запрос от ${request.username} отклонен`);
    }
    
    showUserInfo(user) {
        const userName = document.getElementById('infoUserName');
        const userStatus = document.getElementById('infoUserStatus');
        const userLastSeen = document.getElementById('infoUserLastSeen');
        
        userName.textContent = user.username;
        userStatus.textContent = this.getStatusText(user);
        userLastSeen.textContent = `Был(а) в сети: ${user.lastSeen}`;
        
        this.userInfoModal.classList.add('show');
    }
    
    closeUserInfoModal() {
        this.userInfoModal.classList.remove('show');
    }
    
    // Файлы
    openFileModal() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '*/*';
        
        fileInput.onchange = (e) => {
            const files = Array.from(e.target.files);
            this.selectedFiles = [...this.selectedFiles, ...files];
            this.updateFilePreview();
            this.fileModal.classList.add('show');
        };
        
        fileInput.click();
    }
    
    updateFilePreview() {
        this.filePreview.innerHTML = '';
        
        this.selectedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = file.name;
                    previewItem.appendChild(img);
                };
                reader.readAsDataURL(file);
            } else {
                const fileIcon = document.createElement('div');
                fileIcon.style.fontSize = '2em';
                fileIcon.style.marginBottom = '5px';
                fileIcon.textContent = this.getFileIcon(file.type);
                previewItem.appendChild(fileIcon);
            }
            
            const fileName = document.createElement('div');
            fileName.className = 'preview-name';
            fileName.textContent = file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name;
            previewItem.appendChild(fileName);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => {
                this.selectedFiles.splice(index, 1);
                this.updateFilePreview();
            };
            
            previewItem.appendChild(removeBtn);
            this.filePreview.appendChild(previewItem);
        });
    }
    
    closeFileModal() {
        this.fileModal.classList.remove('show');
    }
    
    sendFiles() {
        if (this.selectedFiles.length === 0 || !this.currentChatId) return;
        
        const message = {
            id: Date.now(),
            senderId: this.currentUser.id,
            senderName: this.currentUser.username,
            avatar: this.currentUser.avatar,
            text: '',
            files: this.selectedFiles,
            time: this.getCurrentTime(),
            type: 'files'
        };
        
        this.addMessageToChat(message);
        this.selectedFiles = [];
        this.closeFileModal();
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Голосовые сообщения
    toggleVoiceRecording() {
        if (this.isRecording) {
            this.stopVoiceRecording();
        } else {
            this.startVoiceRecording();
        }
    }
    
    startVoiceRecording() {
        this.isRecording = true;
        this.recordingTime = 0;
        this.voiceButton.classList.add('recording');
        this.voiceRecordIndicator.classList.add('show');
        
        // Имитация записи
        this.recordingTimer = setInterval(() => {
            this.recordingTime++;
            const minutes = Math.floor(this.recordingTime / 60);
            const seconds = this.recordingTime % 60;
            this.voiceRecordIndicator.querySelector('.timer').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    stopVoiceRecording() {
        if (!this.isRecording) return;
        
        this.isRecording = false;
        this.voiceButton.classList.remove('recording');
        this.voiceRecordIndicator.classList.remove('show');
        clearInterval(this.recordingTimer);
        
        if (this.recordingTime >= 1 && this.currentChatId) {
            this.sendVoiceMessage(this.recordingTime);
        }
    }
    
    sendVoiceMessage(duration) {
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const message = {
            id: Date.now(),
            senderId: this.currentUser.id,
            senderName: this.currentUser.username,
            avatar: this.currentUser.avatar,
            text: 'Голосовое сообщение',
            audio: { duration: durationText },
            time: this.getCurrentTime(),
            type: 'audio'
        };
        
        this.addMessageToChat(message);
    }
    
    // Эмодзи
    toggleEmojiPicker() {
        this.emojiPicker.classList.toggle('show');
    }
    
    // Утилиты
    getCurrentTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' + 
               now.getMinutes().toString().padStart(2, '0');
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Инициализация чата когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    new TamTamChat();
});