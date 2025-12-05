# This tells Docker: "Start with a pre-built image that has Node.js"
FROM node:18-alpine

# Explanation: 
# - node:18-alpine = Small Linux with Node.js 18 pre-installed
# - alpine = Tiny Linux distribution (5MB vs 1GB for full Linux)

# Set working directory inside container
WORKDIR /app

# Create a non-root user for security
# Why? If user code tries to hack, it can't access system files
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Switch to non-root user
USER nodejs

# This is the command that will run when container starts
CMD ["node", "/app/code.js"]

# Explanation of CMD:
# When we start this container, it will automatically run: node /app/code.js
# We'll place user's JavaScript code in a file called 'code.js'