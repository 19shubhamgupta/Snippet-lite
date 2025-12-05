const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { runInDocker } = require("../utils/dockerHelper");
const MessageBroker = require("../messageBroker");

const messageBroker = new MessageBroker();
const pendingExecutions = new Map();

exports.executeCode = async (req, res) => {
  const snippId = req.params.id;
  console.log(`🚀 Executing code for snippet ID - 2: ${snippId}`);
  const executionId = uuidv4();
  let code, language; // Declare variables at function scope

  try {
    const snippetData = await fetchSnippetViaMessage(snippId, req.userId);

    if (!snippetData.success) {
      return res.status(400).json({
        success: false,
        message: `Failed to fetch snippet: ${snippetData.error}`,
      });
    }

    code = snippetData.data.code;
    language = snippetData.data.language;

    console.log(`✅ Retrieved code for snippet: ${snippetData.data.name}`);

    // Validation
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required",
      });
    }
  } catch (error) {
    console.error("❌ Message broker error:", error);
    return res.status(500).json({
      success: false,
      message: `Message broker error: ${error.message}`,
    });
  }

  // Use temp directory outside project to avoid nodemon restart
  const tempdir = path.join(process.cwd(), "..", "temp", executionId);

  try {
    // creating a temp dir for execution
    fs.mkdirSync(tempdir, { recursive: true });

    const getFileName = (language) => {
      const extensions = {
        javascript: "code.js",
        python: "code.py",
        java: "Main.java",
      };

      return extensions[language] || "code.txt";
    };

    const fileName = getFileName(language);
    const codePath = path.join(tempdir, fileName);
    fs.writeFileSync(codePath, code, "utf8");

    const result = await runInDocker(tempdir, language);

    //sending result
    res.json({
      success: true,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      language: language,
    });
  } catch (error) {
    console.error("❌ Execution error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error in executing code",
      error: error.message, // Add error details for debugging
    });
  } finally {
    // Always cleanup temp directory, even if execution fails
    try {
      if (fs.existsSync(tempdir)) {
        fs.rmSync(tempdir, { recursive: true, force: true });
        console.log(`🧹 Cleaned up temp directory: ${tempdir}`);
      }
    } catch (cleanupError) {
      console.error("❌ Cleanup error:", cleanupError.message);
    }
  }
};

const fetchSnippetViaMessage = async (snippetId, userId) => {
  return new Promise((resolve, reject) => {
    const requestId = uuidv4();
    const timeoutDuration = 60000; // 10 seconds timeout

    // Store promise handlers for this request
    pendingExecutions.set(requestId, {
      resolve,
      reject,
      timestamp: Date.now(),
    });
    // Set timeout to reject if no response
    const timeout = setTimeout(() => {
      const pending = pendingExecutions.get(requestId);
      if (pending) {
        pendingExecutions.delete(requestId);
        pending.reject(new Error("Timeout waiting for snippet response"));
      }
    }, timeoutDuration);

    // Publish request message
    messageBroker
      .publishMessage(messageBroker.routingKeys.FETCH_SNIPPET, {
        requestId: requestId,
        snippetId: snippetId,
        userId: userId,
        timestamp: new Date().toISOString(),
      })
      .then(() => {
        console.log(`📤 Snippet fetch request sent for ID: ${snippetId}`);
      })
      .catch((error) => {
        clearTimeout(timeout);
        pendingExecutions.delete(requestId);
        reject(error);
      });
  });
};

const handleSnippetResponse = async (messageContent, originalMsg) => {
  try {
    const { requestId, success, data, error } = messageContent;

    console.log(`📥 Received snippet response for request: ${requestId}`);

    const pending = pendingExecutions.get(requestId);
    if (pending) {
      pendingExecutions.delete(requestId);

      if (success) {
        pending.resolve({ success: true, data: data });
      } else {
        pending.resolve({ success: false, error: error });
      }
    } else {
      console.log(`⚠️  No pending execution found for request: ${requestId}`);
    }
  } catch (error) {
    console.error("❌ Error handling snippet response:", error);
  }
};

exports.initializeBroker = async () => {
  try {
    await messageBroker.initialize();
    await messageBroker.subscribeMessage(
      "EXECUTION_SNIPPET_RESPONSE_QUEUE",
      messageBroker.routingKeys.SNIPPET_RESPONSE,
      handleSnippetResponse
    );
  } catch (error) {
    console.log("error in initialing broker in controller : ", error);
  }
};
