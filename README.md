# AI Auto-Blogging Engine

An automated content generation and publishing system that turns RSS feeds and News APIs into SEO-optimized blog posts using AI.

## Features

- **RSS & News API Ingestion**: Automatically fetch the latest articles from your favorite sources.
- **AI-Powered Rewriting**: Uses OpenAI or Google Gemini to rewrite content from scratch, ensuring 0% plagiarism.
- **SEO Optimization**: Automatically generates SEO-friendly titles, meta descriptions, and structured HTML (H1-H3).
- **Automated Publishing**: Push content directly to WordPress, Webflow, or custom webhooks.
- **Smart Scheduling**: Configure how often you want to publish.
- **Media Management**: Extracts or generates images for your posts.

## Tech Stack

- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL with SQLModel
- **Task Queue**: Celery with Redis
- **Frontend**: Next.js, Tailwind CSS, Lucide React
- **Infrastructure**: Docker & Docker Compose
- **AI**: OpenAI GPT-4, Google Gemini Pro

## Getting Started

### Prerequisites

- Docker and Docker Compose
- OpenAI or Gemini API Key

### Setup

1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in your API keys.
3. Run `docker-compose up --build`.

### Environment Variables

See [.env](.env) for the required configuration.

## Project Structure

- `backend/`: FastAPI application, database models, and Celery tasks.
- `frontend/`: Next.js dashboard for managing projects and sources.
- `infrastructure/`: Additional configuration for deployment.

## License

This project is open-source and available for the community.
