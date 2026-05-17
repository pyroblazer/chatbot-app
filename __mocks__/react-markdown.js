const React = require('react')

function MockMarkdown({ children, components }) {
  if (components && components.p) {
    const P = components.p
    return React.createElement(P, null, children)
  }
  return React.createElement('div', { 'data-testid': 'markdown' }, children)
}

module.exports = { __esModule: true, default: MockMarkdown }
