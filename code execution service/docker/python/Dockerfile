# Start with Python pre-installed
FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S python
RUN adduser -S python -u 1001

# Switch to non-root user  
USER python

# Command to run Python code
CMD ["python", "/app/code.py"]