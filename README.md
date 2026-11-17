# RAG-Based Candidate Profile AI Agent

An AI-powered candidate profile assistant that uses **Retrieval-Augmented Generation (RAG)** to answer interview questions based on my personal profile, skills, education, and projects.

## Live Demo

- **Application:** https://candidate-profile-agent-iota.vercel.app/
- **GitHub:** https://github.com/chirag299051/candidate-profile-agent

## Features

- AI-powered interview question answering using Gemini.
- Context-aware responses using RAG.
- Interactive interview-style conversations.
- Google OAuth authentication.
- Username and password authentication.
- Session management, logout, and password reset.
- Conversation history.

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| AI Model | Google Gemini |
| Embeddings | Gemini Embedding API |
| Authentication | Google OAuth, Session-based authentication |
| Deployment | Vercel (Frontend), Render (Backend) |

## Architecture & RAG Workflow

1. **Data Preparation:** Candidate information is maintained in a structured JavaScript dataset.
2. **Chunking:** Profile information is split into smaller, searchable chunks.
3. **Embedding:** Gemini Embedding API converts chunks into vector embeddings.
4. **Storage:** Chunks and embeddings are stored in MongoDB Atlas.
5. **Retrieval:** User questions are converted into embeddings to retrieve relevant profile information.
6. **Generation:** Retrieved context is passed to Gemini to generate relevant, context-aware answers.

## Local Setup

**1. Clone the repository**

```bash
git clone https://github.com/chirag299051/candidate-profile-agent.git
cd candidate-profile-agent
```

**2. Backend setup**

```bash
cd backend
npm install
```

Create a `.env` file using the following variables:

```env
PORT=5050
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=candidate_profile_db
GEMINI_API_KEY=your_gemini_api_key
GEMINI_CHAT_MODEL=your_gemini_model
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5050/api/auth/google/callback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
```

Start the backend:

```bash
npm start
```

**3. Frontend setup**

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5050/api
```

Start the frontend:

```bash
npm run dev
```

**4. Profile Data Ingestion**

After updating the candidate profile dataset, run the ingestion script from the backend directory:

```bash
node src/ingestProfile.js
```

This generates embeddings and updates the profile data stored in MongoDB Atlas.

## Deployment

- Frontend hosted on Vercel.
- Backend hosted on Render.
- MongoDB Atlas used for cloud database and vector storage.

**Note:** Configure the required environment variables and Google OAuth credentials before running the application. Never commit `.env` files or expose API keys and secrets.