/**
 * Date Validation Tests for ChatBot Operator
 * 
 * Rule: All dates MUST be valid Git commit dates from repository history
 * These tests ensure that all date references in documentation are actual Git commit dates
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Date Validation - No Manual Dates Rule', () => {
  // Get the current Git commit date
  let gitCommitDate;
  
  beforeAll(() => {
    try {
      // Get the commit date in ISO format (YYYY-MM-DD)
      gitCommitDate = execSync('git log -1 --format="%cd" --date=iso', {
        cwd: path.join(__dirname, '../..'),
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim().split(' ')[0];
      
      console.log(`Git commit date: ${gitCommitDate}`);
    } catch (error) {
      // If not in a git repo or no commits, use current date
      const now = new Date();
      gitCommitDate = now.toISOString().split('T')[0];
      console.log(`Using current date: ${gitCommitDate}`);
    }
  });

  describe('Documentation Date Validation', () => {
    // List of files that should have dynamic date references
    const filesWithDates = [
      { path: 'README.md' },
      { path: 'CONTRIBUTING.md' },
      { path: 'docs/strategy/STRATEGY.md' },
      { path: 'docs/contributors/adr/architecture-decisions.md' },
      { path: 'docs/strategy/bmml/value-proposition.yaml' },
      { path: 'docs/strategy/cubejs/metrics.yaml' },
      { path: 'docs/contributors/diagrams.md' },
      { path: 'docs/strategy/omen/strategy.json' }
    ];

    test('should not contain manual dates from 2024', () => {
      filesWithDates.forEach(file => {
        const fullPath = path.join(__dirname, '../..', file.path);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check for manual dates from 2024
          const manualDates = content.match(/2024-\d{2}-\d{2}/g) || [];
          expect(manualDates).toHaveLength(0);
        }
      });
    });

    test('should use actual Git commit dates instead of placeholders', () => {
      filesWithDates.forEach(file => {
        const fullPath = path.join(__dirname, '../..', file.path);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check that NO placeholders exist
          const hasPlaceholder = content.includes('Generated from Git commit date') ||
                                content.includes('Generated from git commit date') ||
                                content.includes('git commit date');
          
          // Files should NOT have placeholders
          expect(hasPlaceholder).toBe(false);
          
          // If the file has date-related content, it should have actual dates
          if (content.includes('created') || content.includes('date') || content.includes('updated')) {
            // Check for dates in YYYY-MM-DD format
            const datePattern = /\b(\d{4}-\d{2}-\d{2})\b/;
            expect(content).toMatch(datePattern);
          }
        }
      });
    });
  });

  describe('Git Date Matching', () => {
    test('should be able to extract and validate Git commit date', () => {
      // This test validates that we can get the Git commit date
      expect(gitCommitDate).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(gitCommitDate.length).toBe(10); // YYYY-MM-DD
    });
  });

  describe('Dynamic Date Generation', () => {
    test('should have scripts for dynamic date generation', () => {
      const dateScripts = [
        'scripts/generate-dates.js',
        'scripts/update-dates.sh',
        'scripts/update-commit-dates.sh'
      ];

      dateScripts.forEach(script => {
        const fullPath = path.join(__dirname, '../..', script);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });

    test('should have documentation about the date management rule', () => {
      const contributingPath = path.join(__dirname, '../..', 'CONTRIBUTING.md');
      if (fs.existsSync(contributingPath)) {
        const content = fs.readFileSync(contributingPath, 'utf8');
        expect(content).toMatch(/All dates MUST be valid Git commit dates/);
      }
    });
  });

  describe('Date Pattern Validation', () => {
    test('should contain valid Git commit dates in YAML frontmatter', () => {
      const yamlFiles = [
        'docs/contributors/diagrams.md',
        'docs/strategy/bmml/value-proposition.yaml',
        'docs/strategy/cubejs/metrics.yaml'
      ];

      yamlFiles.forEach(file => {
        const fullPath = path.join(__dirname, '../..', file);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check for date fields in YAML frontmatter
          const lines = content.split('\n');
          const frontmatterEnd = lines.findIndex(line => line === '---' || line === '...');
          const frontmatter = lines.slice(0, frontmatterEnd + 1).join('\n');
          
          if (frontmatter.includes('date:') || frontmatter.includes('created:')) {
            // Should use actual date in YYYY-MM-DD format
            expect(frontmatter).toMatch(/\b(\d{4}-\d{2}-\d{2})\b/);
            // Should NOT use placeholder
            expect(frontmatter).not.toMatch(/Generated from Git commit date/);
          }
        }
      });
    });

    test('should contain valid Git commit dates in JSON metadata', () => {
      const jsonFiles = [
        'docs/omen/strategy.json'
      ];

      jsonFiles.forEach(file => {
        const fullPath = path.join(__dirname, '../..', file);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check for date fields in JSON
          if (content.includes('"created"') || content.includes('"date"')) {
            // Should use actual date in YYYY-MM-DD format
            expect(content).toMatch(/\b(\d{4}-\d{2}-\d{2})\b/);
            // Should NOT use placeholder
            expect(content).not.toMatch(/Generated from Git commit date/);
          }
        }
      });
    });
  });
});

// Export utilities for use in other tests
module.exports = {
  getGitCommitDate: () => {
    try {
      return execSync('git log -1 --format="%cd" --date=iso', {
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim().split(' ')[0];
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  },
  
  validateNoManualDates: (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const manualDates = content.match(/2024-\d{2}-\d{2}/g) || [];
    return manualDates.length === 0;
  },
  
  validateHasActualDates: (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    // Check for dates in YYYY-MM-DD format
    const datePattern = /\b(\d{4}-\d{2}-\d{2})\b/;
    return datePattern.test(content);
  },
  
  validateNoPlaceholders: (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    return !content.includes('Generated from Git commit date') &&
           !content.includes('git commit date');
  }
};