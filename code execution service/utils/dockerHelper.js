

const { stdout, stderr } = require("process");

const { exec, execFile } = require("child_process");
const path = require("path");

exports.runInDocker = (tempdir, language) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const dockerImage = getDockerImage(language);

    // Convert Windows path to Docker format
    const dockerPath = tempdir.replace(/\\/g, "/");

    console.log(`🐳 Using Docker path: ${dockerPath}`);
    console.log(`🐳 Using Docker image: ${dockerImage}`);

    // Use execFile with arguments array to avoid shell escaping issues
    const dockerArgs = [
      "run",
      "--rm",
      "--memory=128m",
      "--cpus=0.5",
      "--network=none",
      "--read-only",
      "--tmpfs",
      "/tmp:rw,noexec,nosuid,size=10m",
      "-v",
      `${dockerPath}:/app:ro`,
      "--user",
      "1001:1001",
      dockerImage,
    ];

    console.log(`🐳 Docker args:`, dockerArgs.join(" "));

    execFile(
      "docker",
      dockerArgs,
      { timeout: 10000 },
      (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;

        if (error) {
          console.error(`🐳 Docker error:`, error.message);
          // Handle different types of errors
          if (error.code === "ETIMEDOUT") {
            resolve({
              output: "",
              error: "Time Limit Exceeded (10 seconds)",
              executionTime,
            });
          } else if (error.signal === "SIGKILL") {
            resolve({
              output: stdout || "",
              error: "Memory Limit Exceeded or Process Killed",
              executionTime,
            });
          } else {
            resolve({
              output: stdout || "",
              error: stderr || error.message,
              executionTime,
            });
          }
        } else {
          console.log(`🐳 Docker execution successful:`, stdout);
          resolve({
            output: stdout || "",
            error: stderr || "",
            executionTime,
          });
        }
      }
    );
  });
};

const getDockerImage = (language) => {
  const images = {
    javascript: "code-executor-js",
    python: "code-executor-python",
    java: "code-executor-java",
  };

  return images[language] || "code-executor-js";
};
