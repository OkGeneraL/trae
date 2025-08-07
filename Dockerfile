# Stage 1: Build the Next.js frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/webapp/frontend
COPY webapp/frontend/package*.json ./
RUN npm install
COPY webapp/frontend ./
RUN npm run build

# Stage 2: Setup Python backend
FROM python:3.11-slim AS backend-builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Stage 3: Final image
FROM python:3.11-slim
WORKDIR /app

# Copy Python dependencies from backend-builder
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /app/requirements.txt .

# Copy the rest of the application
COPY . .

# Copy the built frontend from frontend-builder
COPY --from=frontend-builder /app/webapp/frontend/.next ./webapp/frontend/.next
COPY --from=frontend-builder /app/webapp/frontend/public ./webapp/frontend/public
COPY --from=frontend-builder /app/webapp/frontend/package.json ./webapp/frontend/package.json
COPY --from=frontend-builder /app/webapp/frontend/next.config.mjs ./webapp/frontend/next.config.mjs

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "webapp.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
