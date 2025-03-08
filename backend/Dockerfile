# Use Python as the base image
FROM python:3.11.3

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    bash \
    build-essential \
    libcurl4-openssl-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Rust (required for some Python packages)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Ollama (if this is the correct command; update if needed)
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Set the working directory
WORKDIR /app

# Copy requirements.txt
COPY requirements.txt .

# Install Python dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Upgrade additional dependencies
RUN pip install --no-cache-dir --upgrade djangorestframework-simplejwt Pillow

# Install langchain_community (or the equivalent package)
RUN pip install --no-cache-dir langchain-community

# Copy the rest of the application code into the container
COPY . .

# Expose the Django port
EXPOSE 3001

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run database migrations and start the Django server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:3001"]
