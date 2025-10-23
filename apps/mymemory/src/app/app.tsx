import { Button } from '@wiowa-tech-studio/ui';
import '../styles.css';

export function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-12 px-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Memory App
          </h1>
          <Button size="lg" className="mb-4">
            Get Started
          </Button>
          <p className="text-xl text-gray-600">
            A federated micro-frontend module
          </p>
        </div>

        {/* Content Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="space-y-6">
            <div className="border-l-4 border-purple-600 pl-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to Memory App
              </h2>
              <p className="text-gray-600">
                This is a remote application loaded via Module Federation. It
                runs independently but integrates seamlessly with the host
                application.
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 text-purple-600 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Independent Deployment
                </h3>
                <p className="text-gray-600 text-sm">
                  Can be deployed and updated independently from the host
                  application.
                </p>
              </div>

              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                  </svg>
                  Shared Dependencies
                </h3>
                <p className="text-gray-600 text-sm">
                  Shares React and other dependencies with the host for optimal
                  performance.
                </p>
              </div>

              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                  </svg>
                  Module Federation
                </h3>
                <p className="text-gray-600 text-sm">
                  Built with Webpack Module Federation for runtime code sharing.
                </p>
              </div>

              <div className="p-6 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 text-orange-600 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  Type Safe
                </h3>
                <p className="text-gray-600 text-sm">
                  Full TypeScript support for type-safe remote module loading.
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Technical Details
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    <strong>Port:</strong> 4201 (development)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    <strong>Exposed Module:</strong> ./Module →
                    ./src/remote-entry.ts
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    <strong>Consumed by:</strong> myhost application
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
