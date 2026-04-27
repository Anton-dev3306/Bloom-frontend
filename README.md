# 🌸 Bloom – Real-Time Messaging App

Bloom is a full-stack real-time messaging platform with support for private and group chats, media sharing, online presence indicators, and SMS account verification.

---

## 🛠️ Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS |
| **Backend** | Spring Boot 3.5, Java 21 |
| **Database** | PostgreSQL (Railway) |
| **Real-time** | WebSocket / STOMP (SockJS) |
| **Media Storage** | Cloudinary |
| **SMS Verification** | Twilio Verify API |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Railway |

---

## ✨ Features

- 💬 Private and group chats in real time
- 📎 Image, video, audio, and file sharing
- 😄 Message reactions with emoji picker
- 🟢 Online presence indicators
- 📱 SMS account verification via Twilio
- 👥 Contact management
- 🖼️ Profile picture upload (Cloudinary)
- 🔍 In-chat message search
- 🗑️ Message and chat deletion



## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/         # Login, register, forgot password
│   └── chat/           # Main chat page
├── components/
│   ├── chat/           # ChatInterface, ChatList, MessageBubble, GroupMembersPanel
│   ├── common/         # AudioBubble, ImageViewer, MessageReactions, ReactionsModal
│   ├── contacts/       # ContactList
│   └── layout/         # Sidebar, ProfilePanel, UserAvatar
├── hooks/
│   ├── useChat.js      # Chat state and API calls
│   └── useWebSocket.js # WebSocket connection management
├── providers/
│   └── UserPresenceProvider.jsx  # Online presence context
└── services/
    ├── websocketService.js       # STOMP client singleton
    ├── fileUploadService.js      # Media upload to backend
    └── api.js                    # Axios instance
```

---

![Bloom Architecture](./Bloom-architecture.png)

## 🔗 Links

- **Live App:** https://bloom-frontend-smoky.vercel.app
- **Backend Repo:** https://github.com/Anton-dev3306/ChatApplication
- **Portfolio:** https://anton-dev.vercel.app
