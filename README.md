# 🌌 AI News Hub (Scrap Feed)

> **"Discover the Future of AI, Tailored Just for You."**

AI News Hub is a premium, Gemini-inspired news curation engine designed to keep you updated with the latest advancements in Artificial Intelligence. Built with a focus on aesthetics and utility, it allows users to monitor specific keywords and receive a perfectly curated stream of tech updates.

![Gemini Aesthetic](images/1.png)

## ✨ Key Features

-   **💎 Gemini Aesthetic**: A stunning UI/UX featuring blue-purple-pink gradients, ethereal background glows, and refined glassmorphism.
-   **🎯 Precise Keyword Filtering**: Define focus keywords like `LLM`, `Generative AI`, or `Tesla Bot` to filter out noise and see only what matters.
-   **🌍 Multi-language Support**: Seamless toggle between **Korean (KO)** and **English (EN)** with localized date formats and UI.
-   **🔄 Real-time Curation**: Fetches latest news from top-tier AI sources including OpenAI Blog, AI Trends, Google News, and more.
-   **🌓 Dark/Light Mode**: Fully optimized themes that maintain premium readability and aesthetics in any environment.
-   **📅 Daily Digest (Planned)**: Set a delivery window for your daily AI summary notifications.

## 🚀 Tech Stack

-   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) (Vanilla CSS Variables)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **State/Context**: React Context API (Theme, Language)
-   **RSS Parsing**: `rss-parser`
-   **Date Handling**: `date-fns`

## 🚀 Getting Started

### 1. Backend Setup (Node.js)
```bash
cd backend
npm install
npm run dev   # Runs on http://localhost:5000
```

### 2. Frontend Setup (Next.js)
In the root directory:
```bash
npm install
npm run dev   # Runs on http://localhost:3000
```

## 📂 Project Structure

```text
├── frontend/ (Root) # Next.js UI
│   ├── src/app/
│   ├── src/components/
│   └── .env.local   # Points to NEXT_PUBLIC_API_URL
└── backend/         # Node.js API Service
    ├── src/
    │   ├── services/
    │   └── server.ts
    └── .env         # Port and environment configs
```

## 📝 Configuration

Users can customize their experience through the **Settings** page:
-   Add/Remove Focus Keywords.
-   Manage Custom RSS Sources.
-   Configure Notification Windows.

---

Built with ❤️ by AI Enthusiasts.
