# 🎙️ Jarvis AI Assistant (v0.2)

Jarvis is a MERN-stack voice + text-based AI assistant powered by **Google Gemini API** (with fallback support for **Groq API**). It leverages the browser's native **Speech Recognition API** and **Speech Synthesis API** to provide interactive voice interactions, intent detection, and local system integration features.

---

## 🚀 Key Features

- **🗣️ Real-time Voice Interaction**: Speaks back using Web Speech Synthesis and listens using Web Speech Recognition.
- **🧠 Intelligent Intent Detection**: Uses Gemini 1.5 Flash (or Groq Llama 3) to convert natural speech into structured JSON intents.
- **🌐 Browser Automation & Web Integration**:
  - Open sites like YouTube, ChatGPT, Instagram, GitHub, Gmail, WhatsApp, Spotify, Netflix.
  - Search Google, YouTube, GitHub, Wikipedia, or Google News.
  - Check the weather, open specific URLs, and more.
- **👤 User Authentication**: Complete Sign-In/Sign-Up system with JWT cookies, BCrypt hashing, and MongoDB database persistence.
- **🎨 Assistant Customization**: Customize the assistant's name, wake words, and visual avatar/image.
- **📜 Session History**: Keeps track of user query histories.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4
- **State & Router**: React Router v7 & React Context API
- **Icons**: React Icons

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB (via Mongoose)
- **AI Integration**: Google Gemini API & Groq API
- **Authentication**: JWT & Cookie Parser
- **File Uploads**: Multer & Cloudinary (for avatar customization)

---

## 📂 Project Structure

```bash
Jarvis-Assistant/
├── backend/
│   ├── config/          # DB, Cloudinary, Token configs
│   ├── controllers/     # Auth & User business logic
│   ├── middlewares/     # JWT Auth and Multer middlewares
│   ├── models/          # MongoDB User Schema
│   ├── routes/          # Express API Endpoints
│   ├── gemini.js        # Gemini/Groq API prompt handler
│   └── index.js         # Entry point for Server
├── frontend/
│   ├── src/
│   │   ├── assets/      # Static images & gifs
│   │   ├── components/  # Shared components (Card, etc.)
│   │   ├── context/     # User Context for global state
│   │   ├── pages/       # Home, Sign In, Sign Up, Customize
│   │   ├── App.jsx      # Root routing
│   │   └── main.jsx     # Vite entry point
└── .gitignore           # Multi-project Git exclusions
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/chetan-c/AI-Assistant--Jarvis-.git
cd AI-Assistant--Jarvis-
```

### 2. Configure Backend Environment
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Optional: Cloudinary configurations for custom avatar uploads
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 3. Run the Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Run the Frontend
Configure backend URL in frontend context or code if needed (defaults to local server):
```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 Supported Voice Intents

You can invoke commands like:
- *"Jarvis, open YouTube"* or *"Launch ChatGPT"*
- *"Search for MERN stack on Google"*
- *"Play relaxing music on YouTube"*
- *"Search for React repositories on GitHub"*
- *"What is the weather in Mumbai?"*
- *"Who created you?"* (Returns: *"chetan created me"*)
