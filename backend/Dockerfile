# Use Python as the base image
FROM python:3.11.3



RUN apt-get update && apt-get install -y \
    curl \
    bash \
    build-essential \
    libcurl4-openssl-dev && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    export PATH="$HOME/.cargo/bin:$PATH" && \
    echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> /etc/profile.d/rust.sh && \
    bash -c 'source /etc/profile.d/rust.sh && rustc --version && cargo --version'

# Set the working directory
WORKDIR /app

# Copy requirements.txt
COPY requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt
RUN pip install --upgrade djangorestframework-simplejwt
RUN pip install Pillow

# Copy the rest of the application code
COPY . .

# Expose the Django port
EXPOSE 3001

# Run database migrations and start the server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:3001"]
