# AI Chatbot - LangChain + Groq + Next.js

An intelligent chatbot application with NLP capabilities built for the *LLM-Based Tools and Generative API Integration for Data Scientists* course.

---

## Target Users / Siapa Target Pengguna Chatbot Ini?

This chatbot is designed for **anyone who needs a smart, context-aware assistant** across multiple domains:

| Persona | Target User |
|---|---|
| ⚡ Productivity Assistant | Professionals, students, and freelancers who want to manage tasks, build better habits, and maximise focus |
| 🎧 Customer Service Bot | Business owners and support teams looking to prototype or demo a customer-facing support assistant |
| 📚 Education Tutor | Students and self-learners who want concepts explained clearly, step-by-step, with a Socratic approach |
| ✈️ Travel Assistant | Travellers planning trips who need destination info, itineraries, visa tips, and budget advice |
| 💻 Code Assistant | Developers and data scientists who need help writing, reviewing, or debugging code across any language |

**Secara umum**, target pengguna utama adalah mahasiswa data science, pengembang perangkat lunak, dan profesional yang ingin memanfaatkan AI conversational dalam pekerjaan sehari-hari mereka - mulai dari perencanaan tugas hingga pemrograman dan eksplorasi perjalanan.

---

## How It Helps / Bagaimana Chatbot Ini Membantu Pengguna?

The chatbot helps users in the following ways:

### 1. Context-Aware Conversation
Retains up to 20 turns of conversation memory per session, so you never have to repeat yourself. The bot understands the full context of your question before responding.

### 2. NLP Insights on Every Response
Every AI reply is automatically analysed for:
- **Intent** - what the user is trying to do (ask, complain, request, greet, etc.)
- **Sentiment** - positive, neutral, or negative tone with a confidence score
- **Named Entities** - people, places, dates, products, and concepts are highlighted in colour

### 3. Knowledge-Augmented Answers (RAG)
Each persona has its own curated knowledge base. When you ask a question, the bot retrieves the most relevant chunks and incorporates them into its answer - giving more accurate, grounded responses.

### 4. Smart Recommendations
After every response, the sidebar suggests 3 follow-up questions tailored to the conversation, helping users explore topics they may not have thought to ask about.

### 5. Persona Switching
Users can switch between 5 specialist bots in one click. The bot immediately adopts a different system prompt, communication style, and knowledge domain - no page reload needed.

### 6. Export & Review
Download the entire conversation as JSON or plain text for review, documentation, or sharing.

### 7. Multi-Chat Groups
Manage multiple named conversations in the sidebar - just like ChatGPT or Claude. Create, rename, switch, and delete chats independently, each with its own persona and message history.

**Secara singkat**, chatbot ini membantu pengguna menjadi lebih produktif dan terinformasi melalui percakapan AI yang kontekstual, cerdas, dan mudah digunakan - mulai dari menjawab pertanyaan teknis, merencanakan perjalanan, hingga men-*debug* kode secara real-time.

---

## Features

- **Multi-conversation sidebar** - create, rename, switch, and delete named chats (like ChatGPT/Claude)
- **Multi-turn memory** - 20-turn sliding window per session
- **Intent classification** - question, complaint, request, greeting, farewell, recommendation_request
- **Sentiment analysis** - emoji badge with positive / neutral / negative + confidence score
- **Named Entity Recognition (NER)** - colour-coded PERSON, PLACE, DATE, PRODUCT, CONCEPT highlights
- **RAG knowledge base** - persona-scoped retrieval from curated markdown documents
- **5 bot personas** - Productivity, Customer Service, Education, Travel, Coder
- **Smart recommendations** - sidebar updated after every AI response
- **3D animated background** - Three.js geometric grid with neon wave and mouse parallax
- **Streaming responses** - token-by-token via ReadableStream
- **Export chat** - JSON or TXT download
- **Dark mode** - high-contrast neon design (cyan, purple, green)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| LLM | Groq API - llama-3.1-8b-instant (free tier) |
| Orchestration | LangChain.js |
| 3D Graphics | Three.js |
| UI | Tailwind CSS v4 + Lucide icons |
| State | Zustand |
| Tests | Jest + React Testing Library + Playwright |
| CI | GitHub Actions |
| Deployment | Vercel |

## Setup

### 1. Get a free Groq API key

Sign up at [console.groq.com](https://console.groq.com) (free, no credit card required).

### 2. Clone and install

```bash
git clone https://github.com/pyroblazer/chatbot-app.git
cd chatbot-app
npm install --legacy-peer-deps
```

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local and add your GROQ_API_KEY
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - redirects to `/chat`.

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (zero warnings)
npm run typecheck    # TypeScript check
npm run test:unit    # Jest unit tests
npm run test:e2e     # Playwright e2e tests
npm run format       # Prettier format
```

## Deployment on Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project → select this repo
3. Framework: **Next.js** (auto-detected)
4. Add environment variable: `GROQ_API_KEY` = your key
5. Deploy

## Project Structure

```
src/
├── app/
│   ├── chat/page.tsx          # Main chat page (client-only)
│   └── api/
│       ├── chat/route.ts      # Streaming chat endpoint
│       ├── recommendations/   # Follow-up suggestions
│       └── export/            # Chat history export
├── components/
│   ├── three/                 # Three.js 3D background
│   ├── chat/                  # Chat UI components
│   └── sidebar/               # Persona, recommendations, export
├── lib/
│   └── langchain/             # Chain, memory, RAG, NLP
├── stores/chatStore.ts        # Zustand state
└── hooks/                     # useChat, useRecommendations
docs/knowledge-base/           # RAG markdown documents (one per persona)
tests/
├── unit/                      # Jest tests
└── e2e/                       # Playwright tests
```

## NLP Implementation

All four NLP tasks (preprocessing, intent classification, sentiment analysis, NER) are performed by the LLM in a single inference call. The system prompt instructs the model to append a structured metadata comment to every response:

```
<!-- NLP_META: {"intent":"question","sentiment":{"label":"positive","score":0.85},"entities":[{"text":"Paris","type":"PLACE"}]} -->
```

The `parseNLPMeta()` function strips this comment from the displayed text and extracts the structured data to drive UI features (sentiment badges, entity highlights).

## Standards Compliance (ISO 25010)

- **Functional Suitability**: All 4 NLP tasks + RAG + 5 personas fully implemented
- **Performance Efficiency**: Groq streaming (~500 tok/s), in-memory vector store
- **Usability**: ARIA labels, keyboard navigation (Ctrl+Enter), contrast ratio ≥ 4.5:1
- **Reliability**: try/catch on all routes, graceful error UI
- **Security**: API key server-only, input sanitization, max 2000 chars
- **Maintainability**: TypeScript strict mode, ESLint, modular architecture
- **Portability**: Swap Groq→OpenAI by editing one file; swap vector store by editing one import

## GitHub CI

Two workflows in `.github/workflows/`:
- **ci.yml**: lint → typecheck → unit tests → build (on push to main)
- **e2e.yml**: Playwright tests (on PRs to main)

Add `GROQ_API_KEY` to GitHub repository Secrets for CI to work.
