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

## Screenshots

<img width="1917" height="862" alt="image" src="https://github.com/user-attachments/assets/154c6742-a1ba-4083-a5c0-4fea696050ed" />


<img width="1900" height="840" alt="image" src="https://github.com/user-attachments/assets/fe9ccec5-92d3-4cfb-8276-517175ecdc65" />


<img width="1505" height="642" alt="image" src="https://github.com/user-attachments/assets/176aae58-a28b-4900-9d4d-de3d1de5e7dc" />


<img width="1887" height="850" alt="image" src="https://github.com/user-attachments/assets/f0687729-27dc-446d-a2c7-79573cdb5693" />


<img width="1532" height="807" alt="image" src="https://github.com/user-attachments/assets/7c5a2afd-15aa-4604-b73a-9b473d52075f" />



