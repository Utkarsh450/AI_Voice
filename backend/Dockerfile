FROM python:3.12-slim

# Install system dependencies
# - openssl: required by Prisma
# - curl: useful for health checks / debugging on Render
RUN apt-get update && apt-get install -y \
    openssl \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Generate Prisma Client (must run after copying prisma/schema.prisma)
# Note: On Linux, psycopg3 works natively with the default event loop,
# so no SelectorEventLoop override is needed (the sys.platform == "win32"
# guard in main.py and agent.py ensures it's only active on Windows).
RUN python -m prisma generate

# Expose port for the FastAPI web service
EXPOSE 10000

# Default command — can be overridden in render.yaml for the agent worker
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
