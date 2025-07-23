# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Create a non-root user
RUN useradd -ms /bin/bash appuser
USER appuser

# Copy the requirements file into the container at /usr/src/app
COPY --chown=appuser:appuser pyproject.toml poetry.lock* /usr/src/app/

# Install any needed packages specified in pyproject.toml
RUN pip install poetry && poetry install --no-root

# Copy the rest of the application's code
COPY --chown=appuser:appuser . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the application
CMD ["poetry", "run", "python", "-m", "trae_agent.cli", "interactive"]
