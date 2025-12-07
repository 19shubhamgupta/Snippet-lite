# Snippet Lite - Code Editor & Execution Platform

A full-stack microservices-based code editor that allows users to create, organize, and execute code snippets in multiple programming languages using Docker containers.

## 🚀 Features

- **Multi-language Code Editor** - Monaco Editor with syntax highlighting for JavaScript, Python, Java, C++, HTML, CSS
- **Folder-based Organization** - VS Code-like file explorer with nested folder structure
- **Secure Code Execution** - Docker-based sandboxed execution environment with resource limits
- **User Authentication** - JWT-based authentication system with secure cookie handling
- **Real-time Updates** - Live code editing and execution with instant feedback
- **Responsive UI** - Modern dark theme interface built with React and Tailwind CSS

## 🏗️ Architecture

This project follows a microservices architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  API Gateway    │    │  User Service   │
│   (React)       │◄──►│   (Nginx)       │◄──►│   (Node.js)     │
│   Port: 5173    │    │   Port: 8000    │    │   Port: 8002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Code Execution  │    │ Snippet Service │    │    MongoDB      │
│   Service       │◄──►│   (Node.js)     │◄──►│   Database      │
│   (Node.js)     │    │   Port: 8001    │    │   Port: 27017   │
│   Port: 8003    │    └─────────────────┘    └─────────────────┘
└─────────────────┘
```

## Optimization Features

Our Nginx API Gateway acts as a smart entry point that protects and manages all requests:

### 🚦 Rate Limiting - Prevents Spam & Abuse

**What it does:** Limits how many requests a user can make per second

- **Normal Operations** (login, save snippets): Max 10 requests/second
  - If you try to send 30 requests at once, 20 go through, and the rest are rejected
  
- **Code Execution** (running code): Max 2 requests/second
  - Stricter because running code uses more server resources

**Why it matters:** Stops people from overwhelming the server with too many requests

### ⚡ Timeouts - Prevents Long Waits

**What it does:** Sets a maximum wait time for responses from backend services

- **Login/Save operations**: Wait max 30 seconds
- **Code execution**: Wait max 120 seconds (code takes longer to run)

**Why it matters:** 
- If a service crashes, you get an error quickly instead of waiting forever
- Keeps the app responsive even when something goes wrong
- Like a circuit breaker - fails fast to protect the whole system

### 🔄 Load Balancing - Prepares for Growth

**What it does:** Routes requests to the right backend service

Currently configured services:
- User Service (port 8002)
- Snippet Service (port 8001)  
- Code Execution Service (port 8003)

**Why it matters:**
- Easy to add more servers when you get more users
- If one server fails, traffic goes to healthy servers automatically
- Distributes work evenly across multiple servers

### 🛡️ Security & Size Limits

**Protections in place:**
- **10MB upload limit** - Can't upload huge files that crash the server
- **IP tracking** - Knows the real user IP even through proxies
- **Header validation** - Only accepts properly formatted requests

**Why it matters:** Multiple layers of protection against attacks and misuse


