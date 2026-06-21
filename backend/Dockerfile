FROM python:3.12-slim

# Install system dependencies (Prisma requires openssl)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Generate Prisma Client for the database
RUN prisma py generate

# Expose port for the FastAPI web service
EXPOSE 10000

# The default command (can be overridden by render.yaml for the background worker)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
