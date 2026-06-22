FROM nikolaik/python-nodejs:python3.12-nodejs20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y openssl curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Set up user and permissions (required by HF Spaces, works fine locally)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy application files
COPY --chown=user . $HOME/app

# Build Next.js frontend
WORKDIR $HOME/app/frontend
RUN npm install
RUN npm run build

# Install Python dependencies
WORKDIR $HOME/app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Generate Prisma client during build to save startup time
RUN python -m prisma generate

# Go back to app root
WORKDIR $HOME/app

EXPOSE 7860

# Run both the LiveKit Agent and the FastAPI Web Server (which serves the frontend) using a single bash command.
# This avoids needing a separate start.sh file and prevents Windows CRLF line-ending issues in Docker.
CMD ["bash", "-c", "cd backend && python agent.py start & cd backend && uvicorn main:app --host 0.0.0.0 --port 7860"]
