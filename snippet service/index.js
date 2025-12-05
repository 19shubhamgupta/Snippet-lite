const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const MessageBroker = require("./messageBroker/index");
const dotenv = require("dotenv");
const Snippet = require("./models/snippet"); // Assuming you have this model

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(express.json());
// app.use(cors()); // Disabled - CORS handled by Nginx

const messageBroker = new MessageBroker();

// Message handler for snippet fetch requests
const handleSnippetFetchRequest = async (messageContent) => {
  try {
    const { snippetId, requestId } = messageContent;

    console.log(`🔍 Processing snippet fetch request for ID: ${snippetId}`);

    // Fetch snippet from database (removed user filtering for testing)
    const snippet = await Snippet.findById(snippetId);

    console.log(`📊 Database query result:`, snippet);

    let responseMessage;

    if (snippet) {
      // Snippet found - send success response
      responseMessage = {
        requestId: requestId,
        success: true,
        data: {
          snippetId: snippet._id,
          code: snippet.code,
          language: snippet.language || "javascript", // fallback
          name: snippet.folderName, // Using correct field name
        },
      };
      console.log(`✅ Snippet found: ${snippet.folderName}`);
    } else {
      // Snippet not found - send error response
      responseMessage = {
        requestId: requestId,
        success: false,
        error: "Snippet not found or access denied",
      };
      console.log(`❌ Snippet not found for ID: ${snippetId}`);
    }

    // Send response back to execution service
    await messageBroker.publishMessage(
      messageBroker.routingKeys.SNIPPET_RESPONSE,
      responseMessage,
      { correlationId: requestId }
    );
  } catch (error) {
    console.error("❌ Error handling snippet fetch request:", error);

    // Send error response
    const errorResponse = {
      requestId: messageContent.requestId,
      success: false,
      error: "Internal server error while fetching snippet",
    };

    await messageBroker.publishMessage(
      messageBroker.routingKeys.SNIPPET_RESPONSE,
      errorResponse,
      { correlationId: messageContent.requestId }
    );
  }
};

app.use("/snipp", require("./routes/snippetRouter"));
app.use("/folder", require("./routes/folderRouter"));

// Health check
app.get("/health", (req, res) => {
  res.json({ service: "snippet", status: "healthy", port: 8001 });
});

app.listen(8001, async () => {
  try {
    // Connect to MongoDB using environment variable
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Initialize message broker
    await messageBroker.initialize();

    // Subscribe to snippet fetch requests
    await messageBroker.subscribeMessage(
      "SNIPPET_FETCH_QUEUE",
      messageBroker.routingKeys.FETCH_SNIPPET,
      handleSnippetFetchRequest
    );

    console.log("Snippet service fully initialized at 8001");
  } catch (error) {
    console.log(`error while initialing things inn Snippet Service : ${error}`);
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  await messageBroker.closeMessageBroker();
  process.exit(0);
});
