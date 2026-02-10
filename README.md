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

## 🛠️ Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/heeya81/ai-news-hub.git
    cd ai-news-hub
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run locally**:
    ```bash
    npm run dev
    ```

4.  **Open in browser**:
    Navigate to `http://localhost:3000`

## 📂 Project Structure

```text
src/
├── app/             # Next.js App Router (Pages & APIs)
├── components/      # Reusable UI Components (Providers, Controls)
├── lib/             # Core Logic (News Fetcher, Translations, Utils)
└── styles/          # Global CSS and Theme configurations
```

## 📝 Configuration

Users can customize their experience through the **Settings** page:
-   Add/Remove Focus Keywords.
-   Manage Custom RSS Sources.
-   Configure Notification Windows.

---

Built with ❤️ by AI Enthusiasts.
