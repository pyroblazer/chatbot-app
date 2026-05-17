const nextJest = require('next/jest.js')

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-markdown$': '<rootDir>/__mocks__/react-markdown.js',
  },
  testMatch: ['<rootDir>/tests/unit/**/*.test.{ts,tsx}'],
  maxWorkers: '90%',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    // Type definitions have no runtime coverage
    '!src/**/*.d.ts',
    '!src/types/**',
    // Server-only: Next.js API routes run in Node, not jsdom
    '!src/app/api/**',
    // Thin wrappers / entry points with no logic
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
    '!src/app/chat/page.tsx',
    // Three.js WebGL cannot run in jsdom
    '!src/components/three/**',
    // LangChain server-side chain/RAG/vectorstore (requires Node fs, embeddings)
    '!src/lib/groq.ts',
    '!src/lib/langchain/chain.ts',
    '!src/lib/langchain/rag.ts',
    '!src/lib/langchain/vectorstore.ts',
    '!src/lib/langchain/prompts.ts',
    // Top-level orchestrator components with heavy external deps
    '!src/components/chat/ChatUI.tsx',
    '!src/hooks/useChat.ts',
    '!src/hooks/useRecommendations.ts',
    '!src/components/sidebar/Sidebar.tsx',
    '!src/components/sidebar/ExportButton.tsx',
  ],
  coverageThreshold: {
    global: { lines: 70 },
  },
}

module.exports = createJestConfig(config)
