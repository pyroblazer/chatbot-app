require('@testing-library/jest-dom')

// Polyfill TextEncoder/TextDecoder for LangChain compatibility
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// jsdom does not implement scrollIntoView — only patch in browser-like environments
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
}
