/**
 * Commitlint Configuration for ChatBot Operator
 * =============================================
 * Enforces Conventional Commits standard
 * References: docs/omen/strategy.json (Constraint C004)
 * References: docs/adr/architecture-decisions.md (ADR-012)
 * 
 * Based on: https://www.conventionalcommits.org/
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  
  // Custom rules for ChatBot Operator project
  rules: {
    // Subject must be in lowercase
    'subject-case': [2, 'always', 'lower-case'],
    
    // Subject must not end with a period
    'subject-full-stop': [2, 'never', '.'],
    
    // Subject must be 72 characters or less
    'subject-max-length': [2, 'always', 72],
    
    // Type must be in lowercase
    'type-case': [2, 'always', 'lower-case'],
    
    // Scope must be in lowercase
    'scope-case': [2, 'always', 'lower-case'],
    
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    
    // Type must not be empty
    'type-empty': [2, 'never'],
    
    // Subject must start with a verb (imperative mood)
    'subject-exclamation-mark': [2, 'never'],
    
    // Footer must not be empty if present
    'footer-empty': [2, 'never'],
    
    // Body must not be empty if present
    'body-empty': [2, 'never']
  },
  
  // Custom prompt for commitizen (optional)
  prompt: {
    questions: {
      type: {
        description: 'Select the type of change that you\'re committing',
        choices: [
          { value: 'feat', name: 'feat:     A new feature' },
          { value: 'fix', name: 'fix:      A bug fix' },
          { value: 'docs', name: 'docs:     Documentation only changes' },
          { value: 'style', name: 'style:    Changes that do not affect the meaning of the code' },
          { value: 'refactor', name: 'refactor: A code change that neither fixes a bug nor adds a feature' },
          { value: 'perf', name: 'perf:     A code change that improves performance' },
          { value: 'test', name: 'test:     Adding missing tests' },
          { value: 'chore', name: 'chore:    Changes to the build process or auxiliary tools' },
          { value: 'revert', name: 'revert:   Revert to a commit' },
          { value: 'WIP', name: 'WIP:      Work in progress' }
        ]
      },
      scope: {
        description: 'What is the scope of this change (e.g. component or file name)'
      },
      subject: {
        description: 'Write a short, imperative tense description of the change' 
      },
      body: {
        description: 'Provide a longer description of the change (optional). Use "|" to break new line' 
      },
      footer: {
        description: 'Add any issues that this commit closes (optional). E.g.: Closes #123, Fixes #456' 
      }
    }
  },
  
  // Custom types for ChatBot Operator
  types: [
    'build',
    'chore',
    'ci',
    'docs',
    'feat',
    'fix',
    'perf',
    'refactor',
    'revert',
    'style',
    'test'
  ],
  
  // Custom scopes for ChatBot Operator
  scopes: [
    'operator',
    'crds',
    'controller',
    'provisioners',
    'slack',
    'matrix',
    'discord',
    'twilio',
    'security',
    'linkerd',
    'rbac',
    'abac',
    'ci-cd',
    'github-actions',
    'tekton',
    'gitlab-ci',
    'validation',
    'testing',
    'documentation',
    'devpod',
    'vale',
    'strategy',
    'architecture'
  ],
  
  // Custom subject patterns
  subjectPattern: '^[a-z]+(?:\s[a-z0-9-]+)*:\s.+$',
  subjectPatternErrorMsg: 'Subject must start with type: description (e.g., "feat: add new feature")'
};
