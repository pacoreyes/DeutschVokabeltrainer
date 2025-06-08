# AGENT.md

## Purpose

This document defines the coding guidelines, architectural principles, and behavior expectations for the AI coding agent contributing to this project.

---

## General Principles

- Follow clean code practices (clarity over cleverness).
- Prefer simplicity and readability over premature optimization.
- Separate concerns:
    - HTML for structure
    - CSS (or Tailwind) for style
    - JavaScript for behavior/functionality

---

## Code Structure

- Use a modular architecture: separate files for components, utilities, styles, etc.
- Place reusable logic in helper or utility functions.
- Follow naming conventions consistently (camelCase for JS variables/functions, kebab-case for CSS classes, PascalCase for React components).

---

## HTML

- Use semantic HTML elements where appropriate (`<section>`, `<article>`, `<nav>`, etc.).
- Keep HTML markup minimal and clean; avoid inline styles or scripts.

---

## CSS

- Use external stylesheets or utility-first CSS frameworks (like Tailwind CSS).
- Avoid inline styles unless absolutely necessary.
- Group related styles together and comment major sections.

---

## JavaScript

- Always use ES6+ syntax:
    - Use `const` and `let` instead of `var`
    - Use arrow functions when appropriate
    - Prefer destructuring, template literals, and concise object syntax

- **Asynchronous Code**
    - Always use `async/await` instead of `.then()`/`.catch()` for handling Promises
    - Avoid callback-based async patterns unless interacting with legacy code
    - Ensure all `await` calls are inside properly declared `async` functions
    - Use `try...catch` blocks for error handling in async functions

  ❌ Bad:
  ```js
  fetch('/api/data')
    .then(response => response.json())
    .then(data => console.log(data));

---

## Version Control

- Write meaningful commit messages.
- Group related changes into single commits.

---

## Optional (Framework-Specific Rules)

If using a framework like React, Vue, or Svelte, define component patterns and structure, e.g.:

- React: Use functional components and React hooks. Avoid class components.
- Vue: Use `<script setup>` when possible. Separate template, script, and style blocks clearly.

---

## Agent Behavior

- Before generating code, check for existing patterns in the project and align with them.
- Refactor existing code only if necessary and with minimal disruption.
- Document any non-obvious logic in comments.

---

## Testing (if applicable)

- Write unit tests for new components/functions.
- Use Jest, Vitest, or other tools depending on the project stack.

---

## Communication

If this agent is used in collaboration with human developers, clarify uncertain design decisions through TODO comments or markdown notes.
