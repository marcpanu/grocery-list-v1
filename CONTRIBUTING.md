# Contributing to Smart Shopping List

Thank you for your interest in contributing to Smart Shopping List! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. By participating, you are expected to uphold this code.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## Getting Started

1. **Fork the Repository**
   ```bash
   # Clone your fork
   git clone https://github.com/your-username/ShoppingList.git
   cd ShoppingList

   # Add upstream remote
   git remote add upstream https://github.com/original/ShoppingList.git
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

4. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

1. **Keep Your Fork Updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Test Your Changes**
   ```bash
   # Run linter
   npm run lint

   # Run tests (when implemented)
   npm test
   ```

## Pull Request Process

1. **Before Submitting**
   - Ensure your code follows our coding standards
   - Add/update relevant documentation
   - Add/update tests as needed
   - Ensure all tests pass
   - Run the linter and fix any issues

2. **Submitting Changes**
   - Push to your fork
   - Submit a pull request to the `main` branch
   - Fill out the PR template completely
   - Link any relevant issues

3. **After Submitting**
   - Respond to review comments
   - Make requested changes
   - Rebase onto latest main if needed
   - Update documentation as needed

## Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Define explicit types for props, state, and functions
- Avoid using `any` type
- Use interfaces for object types
- Use proper type imports/exports

### React Guidelines

- Use functional components with hooks
- Keep components focused and single-responsibility
- Use proper prop-types or TypeScript interfaces
- Follow React best practices for performance

### Styling Guidelines

- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Maintain consistent spacing and layout
- Use design system tokens

### File Structure

```
src/
├── components/        # React components
│   ├── core/         # Reusable core components
│   ├── recipes/      # Recipe-related components
│   └── settings/     # Settings-related components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── types/            # TypeScript types/interfaces
├── services/         # External service integrations
└── firebase/         # Firebase configuration
```

## Commit Guidelines

- Use conventional commits format
- Keep commits focused and atomic
- Write clear commit messages

### Commit Message Format
```
type(scope): subject

body

footer
```

### Types
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance tasks

## Issue Guidelines

1. **Before Creating an Issue**
   - Search existing issues
   - Check if it's already being worked on
   - Read the documentation

2. **Creating an Issue**
   - Use issue templates when available
   - Provide clear reproduction steps
   - Include relevant system information
   - Add appropriate labels

3. **Issue Types**
   - Bug Report
   - Feature Request
   - Documentation Update
   - Question/Support

### Bug Reports Should Include

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- System information
- Relevant logs

### Feature Requests Should Include

- Clear description of the feature
- Use case and benefits
- Potential implementation approach
- Mock-ups or examples if applicable

## Questions?

If you have questions about contributing, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with the question label

Thank you for contributing to Smart Shopping List! 🎉 