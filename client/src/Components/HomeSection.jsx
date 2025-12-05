const HomeSection = () => {
  return (
    <div className="min-h-screen bg-gray-900 pt-2">
      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-6">
            Code Editor Platform
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            A powerful online code editor with real-time execution. Write,
            organize, and run your JavaScript, Python, and Java code snippets
            instantly with our microservices-powered platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <div className="bg-gray-800 p-8 rounded-lg">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Instant Execution
            </h3>
            <p className="text-gray-400">
              Execute your code instantly with our Docker-powered execution
              engine. Support for JavaScript, Python, and Java.
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg">
            <div className="text-3xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Snippet Organization
            </h3>
            <p className="text-gray-400">
              Organize your code snippets in folders. Save, edit, and manage
              your code efficiently with our intuitive interface.
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Secure & Scalable
            </h3>
            <p className="text-gray-400">
              Built with microservices architecture, featuring secure code
              execution in isolated Docker containers.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Built With Modern Technology
          </h2>
          <div className="flex flex-wrap justify-center gap-6 text-gray-300">
            <span className="bg-gray-800 px-4 py-2 rounded-full">Node.js</span>
            <span className="bg-gray-800 px-4 py-2 rounded-full">React</span>
            <span className="bg-gray-800 px-4 py-2 rounded-full">Docker</span>
            <span className="bg-gray-800 px-4 py-2 rounded-full">MongoDB</span>
            <span className="bg-gray-800 px-4 py-2 rounded-full">RabbitMQ</span>
            <span className="bg-gray-800 px-4 py-2 rounded-full">Nginx</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;
