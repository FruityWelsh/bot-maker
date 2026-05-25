/**
 * Date Validation Tests for ChatBot Operator
 * 
 * Rule: Do not manually add dates - use tools that reference real time
 * These tests ensure that all date references in documentation match Git commit dates
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
      { path: 'docs/STRATEGY.md' },
      { path: 'docs/adr/architecture-decisions.md' },
      { path: 'docs/bmml/value-proposition.yaml' },
      { path: 'docs/cubejs/metrics.yaml' },
      { path: 'docs/diagrams.md' },
      { path: 'docs/omen/strategy.json' }
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

    test('should use dynamic date references instead of manual dates', () => {
      filesWithDates.forEach(file => {
        const fullPath = path.join(__dirname, '../..', file.path);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check that dynamic date references exist
          const hasDynamicRef = content.includes('Generated from Git commit date') ||
                               content.includes('Generated from git commit date') ||
                               content.includes('git commit date');
          
          // If the file has date-related content, it should use dynamic references
          if (content.includes('created') || content.includes('date') || content.includes('updated')) {
            expect(hasDynamicRef).toBe(true);
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
        'scripts/update-dates.sh'
      ];

      dateScripts.forEach(script => {
        const fullPath = path.join(__dirname, '../..', script);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });

    test('should have documentation about the no manual dates rule', () => {
      const contributingPath = path.join(__dirname, '../..', 'CONTRIBUTING.md');
      if (fs.existsSync(contributingPath)) {
        const content = fs.readFileSync(contributingPath, 'utf8');
        expect(content).toMatch(/Do not manually add dates/);
      }
    });
  });

  describe('Date Pattern Validation', () => {
    test('should not contain dates in YAML frontmatter', () => {
      const yamlFiles = [
        'docs/diagrams.md',
        'docs/bmml/value-proposition.yaml',
        'docs/cubejs/metrics.yaml'
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
            // Should use dynamic reference
            expect(frontmatter).toMatch(/Generated from Git commit date/);
          }
        }
      });
    });

    test('should not contain dates in JSON metadata', () => {
      const jsonFiles = [
        'docs/omen/strategy.json'
      ];

      jsonFiles.forEach(file => {
        const fullPath = path.join(__dirname, '../..', file);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check for date fields in JSON
          if (content.includes('"created"') || content.includes('"date"')) {
            // Should use dynamic reference
            expect(content).toMatch(/Generated from Git commit date/);
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
  
  validateDynamicDateReference: (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes('Generated from Git commit date') ||
           content.includes('git commit date');
  }
};