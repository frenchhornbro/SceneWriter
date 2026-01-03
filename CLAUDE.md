# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SceneWriter is an AI-powered creative writing assistant that helps authors write fiction scenes. Users provide context (story overview, characters, plot points, writing style samples), and the AI generates scenes matching their style. The intent is human-first: AI assists but doesn't remove creative responsibility from the author.

## Development Commands

### Backend (Express.js + TypeScript)
```bash
cd backend
npm run dev      # Development server (port 7458)
npm run prod     # Production server
npm run build    # Compile TypeScript to dist/
```

### Frontend (Next.js + React)
```bash
cd web
npm run dev      # Development server (port 3500)
npm run build    # Production build
npm run lint     # ESLint
npm start        # Production server
```

Both servers must run simultaneously for the application to work.

## Architecture

### Directory Structure
- `backend/` - Express.js TypeScript backend
- `web/` - Next.js 16 + React 19 frontend
- `shared/templates/` - TypeScript types shared between frontend and backend

### Backend Layers
- `route/` - API route handlers (REST endpoints)
- `data-access/` - Database layer using better-sqlite3
- `ai/` - AI model integration (OpenAI API or local Ollama)
- `db/schema.sql` - SQLite database schema

### Frontend Structure
- `app/` - Next.js App Router pages
- `components/ui/` - Radix UI component wrappers
- `lib/requests.ts` - HTTP client wrapper for backend calls

### Data Flow
1. Frontend sends requests via `serverRequest()` to backend
2. Backend routes validate input and call data-access layer
3. For scene generation: backend collects context (characters, plot points, writing samples, adjacent scenes), builds prompt, sends to AI model
4. AI response stored as new scene version

### Key Patterns
- **Scene Versioning**: Scenes use composite primary key (id, version). Regenerating creates a new version.
- **Error Handling**: `errorHandlerWrapper` and `transactionWrapper` in data-access layer
- **Path Aliases**: `@shared/*` for shared types, `@/*` for frontend components

## Environment Configuration

### Backend (.env.dev or .env.prod)
```
SERVER_PORT=7458
USE_LOCAL_MODEL="true"       # "true" for Ollama, "false" for OpenAI
LOCAL_MODEL_URL="http://localhost:11434/api/generate"
OPENAI_API_KEY=""            # Required if USE_LOCAL_MODEL="false"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SERVER_URL="http://localhost"
NEXT_PUBLIC_SERVER_PORT=7458
```

## Database

SQLite database at `backend/db/scenewriter.sqlite`. Schema in `backend/db/schema.sql`.

Core entities: Story, Character, Scene (versioned), PlotPoint, WritingStyleSample

Junction tables: CharacterRelationship, SceneCharacter, ScenePlotPoint, CharacterPlotPoint

## AI Integration

Two modes controlled by `USE_LOCAL_MODEL`:
- **Local**: Ollama at `LOCAL_MODEL_URL` (gemma3, llama3.2)
- **API**: OpenAI via `OPENAI_API_KEY`

Prompt engineering in `backend/ai/prompts.ts` - includes character details, plot points, writing style samples, and adjacent scene text for context.
