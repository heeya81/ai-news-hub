# 📜 AI News Hub API Protocol (v1.0)

This document defines the communication protocol between the Frontend and Backend services.

## 🏁 Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://api.ainewshub.com` (Example)

## 🛠️ Common Header Rules
- `Content-Type: application/json`
- `Accept-Language: ko | en` (Used for localized messages if handled by server)

---

## 📡 API Endpoints

### 1. Fetch News
Retrieves a list of AI news items, optionally filtered by keywords provided by the user.

- **URL**: `/api/news`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "keywords": ["AI 보안", "LLM"],  // Optional: List of keywords to filter
    "sources": [                   // Optional: Custom RSS sources
      { "name": "Source Name", "url": "https://..." }
    ],
    "hours": 168                   // Optional: Time window in hours (Default: 168)
  }
  ```
- **Response (Success)**: `200 OK`
  ```json
  {
    "success": true,
    "news": [
      {
        "title": "News Title",
        "link": "https://...",
        "pubDate": "2026-02-10T...",
        "content": "Snippet...",
        "source": "Source Name"
      }
    ],
    "count": 12
  }
  ```

### 2. Get Default Sources
Retrieves the system's default RSS sources.

- **URL**: `/api/sources/default`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "sources": [
      { "name": "AI Trends", "url": "..." },
      ...
    ]
  }
  ```

---

## ⚠️ Error Handling
All error responses will follow this format:
- **Response**: `4xx` or `5xx`
  ```json
  {
    "success": false,
    "error": "Error message description",
    "code": "ERROR_CODE"
  }
  ```

## 🔒 Security
(Future Implementation)
- **Authentication**: JWT via `Authorization: Bearer <token>`
- **CORS**: Restricted to approved frontend domains only.
