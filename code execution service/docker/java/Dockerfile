# Use the official Eclipse Temurin JDK (recommended replacement)
FROM eclipse-temurin:17-alpine

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S java
RUN adduser -S java -u 1001

# Switch to non-root user
USER java

# For Java, we need to compile first, then run
CMD ["sh", "-c", "javac /app/Main.java && java -cp /app Main"]