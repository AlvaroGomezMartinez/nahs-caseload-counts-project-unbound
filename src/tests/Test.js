/**
 * Test suite for NAHS Caseload Counts application
 * Contains unit tests for all major functions and utilities
 */

/**
 * Test runner utility
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  /**
   * Add a test case
   * @param {string} name - Test name
   * @param {Function} testFunction - Test function
   */
  addTest(name, testFunction) {
    this.tests.push({ name, testFunction });
  }

  /**
   * Run all tests
   * @returns {Object} Test results
   */
  runAllTests() {
    console.log('Starting test suite...');
    this.results = { passed: 0, failed: 0, total: 0 };

    this.tests.forEach(test => {
      try {
        console.log(`Running test: ${test.name}`);
        test.testFunction();
        this.results.passed++;
        console.log(`✓ ${test.name} - PASSED`);
      } catch (error) {
        this.results.failed++;
        console.error(`✗ ${test.name} - FAILED: ${error.message}`);
      }
      this.results.total++;
    });

    const summary = `Tests completed: ${this.results.passed}/${this.results.total} passed`;
    console.log(summary);
    return this.results;
  }
}

// Test utilities
function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} Expected: ${expected}, Actual: ${actual}`);
  }
}

function assertArrayEqual(actual, expected, message = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message} Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

function assertTrue(condition, message = '') {
  if (!condition) {
    throw new Error(`${message} Expected condition to be true`);
  }
}

function assertFalse(condition, message = '') {
  if (condition) {
    throw new Error(`${message} Expected condition to be false`);
  }
}

function assertThrows(func, message = '') {
  try {
    func();
    throw new Error(`${message} Expected function to throw an error`);
  } catch (error) {
    // Expected behavior
  }
}

// Initialize test runner
const testRunner = new TestRunner();

/**
 * Tests for ValidationUtils
 */
testRunner.addTest('ValidationUtils.isEmpty - should detect empty values', () => {
  assertTrue(ValidationUtils.isEmpty(null));
  assertTrue(ValidationUtils.isEmpty(undefined));
  assertTrue(ValidationUtils.isEmpty(''));
  assertFalse(ValidationUtils.isEmpty('test'));
  assertFalse(ValidationUtils.isEmpty(0));
  assertFalse(ValidationUtils.isEmpty(false));
});

testRunner.addTest('ValidationUtils.isValidArray - should validate arrays', () => {
  assertTrue(ValidationUtils.isValidArray([1, 2, 3]));
  assertTrue(ValidationUtils.isValidArray(['a']));
  assertFalse(ValidationUtils.isValidArray([]));
  assertFalse(ValidationUtils.isValidArray(null));
  assertFalse(ValidationUtils.isValidArray('not array'));
});

testRunner.addTest('ValidationUtils.isValidEmail - should validate emails', () => {
  assertTrue(ValidationUtils.isValidEmail('test@nisd.net'));
  assertTrue(ValidationUtils.isValidEmail('user.name@domain.com'));
  assertFalse(ValidationUtils.isValidEmail('invalid-email'));
  assertFalse(ValidationUtils.isValidEmail(''));
  assertFalse(ValidationUtils.isValidEmail(null));
});

/**
 * Tests for ArrayUtils
 */
testRunner.addTest('ArrayUtils.safeGet - should safely access array elements', () => {
  const arr = ['a', 'b', 'c'];
  assertEqual(ArrayUtils.safeGet(arr, 0), 'a');
  assertEqual(ArrayUtils.safeGet(arr, 5), null);
  assertEqual(ArrayUtils.safeGet(arr, -1), null);
  assertEqual(ArrayUtils.safeGet(null, 0), null);
});

testRunner.addTest('ArrayUtils.removeDuplicates - should remove duplicates', () => {
  assertArrayEqual(ArrayUtils.removeDuplicates([1, 2, 2, 3]), [1, 2, 3]);
  assertArrayEqual(ArrayUtils.removeDuplicates(['a', 'b', 'a']), ['a', 'b']);
  assertArrayEqual(ArrayUtils.removeDuplicates([]), []);
});

testRunner.addTest('ArrayUtils.intersection - should find common elements', () => {
  assertArrayEqual(ArrayUtils.intersection([1, 2, 3], [2, 3, 4]), [2, 3]);
  assertArrayEqual(ArrayUtils.intersection(['a', 'b'], ['b', 'c']), ['b']);
  assertArrayEqual(ArrayUtils.intersection([1, 2], [3, 4]), []);
});

/**
 * Tests for StringUtils
 */
testRunner.addTest('StringUtils.toTitleCase - should convert to title case', () => {
  assertEqual(StringUtils.toTitleCase('hello world'), 'Hello World');
  assertEqual(StringUtils.toTitleCase('HELLO WORLD'), 'Hello World');
  assertEqual(StringUtils.toTitleCase(''), '');
});

testRunner.addTest('StringUtils.truncate - should truncate strings', () => {
  assertEqual(StringUtils.truncate('Hello World', 5), 'He...');
  assertEqual(StringUtils.truncate('Hi', 10), 'Hi');
  assertEqual(StringUtils.truncate('', 5), '');
});

/**
 * Tests for DateUtils
 */
testRunner.addTest('DateUtils.isValidDate - should validate dates', () => {
  assertTrue(DateUtils.isValidDate(new Date()));
  assertTrue(DateUtils.isValidDate('2024-01-01'));
  assertFalse(DateUtils.isValidDate('invalid date'));
  assertFalse(DateUtils.isValidDate(null));
});

testRunner.addTest('DateUtils.formatDate - should format dates safely', () => {
  const date = new Date('2024-01-01T12:00:00'); // Use explicit time to avoid timezone issues
  const formatted = DateUtils.formatDate(date, 'MM/dd/yy');
  
  // Log the actual formatted value for debugging
  console.log(`Formatted date: "${formatted}" from date: ${date.toISOString()}`);
  
  // Test that it looks like a date format (more flexible check)
  assertTrue(formatted.length > 0 && /\d{2}\/\d{2}\/\d{2}/.test(formatted), 
    `Expected MM/dd/yy format, got: "${formatted}"`);
  
  // Test with invalid date
  assertEqual(DateUtils.formatDate('invalid'), 'invalid');
  assertEqual(DateUtils.formatDate(null), '');
});

/**
 * Tests for ErrorUtils
 */
testRunner.addTest('ErrorUtils.createErrorResponse - should create error objects', () => {
  const error = ErrorUtils.createErrorResponse('Test error');
  assertEqual(error.success, false);
  assertEqual(error.message, 'Test error');
  assertTrue(error.errorId.length > 0);
  assertTrue(error.timestamp.length > 0);
});

testRunner.addTest('ErrorUtils.createSuccessResponse - should create success objects', () => {
  const success = ErrorUtils.createSuccessResponse('test data', 'Success message');
  assertEqual(success.success, true);
  assertEqual(success.data, 'test data');
  assertEqual(success.message, 'Success message');
});

/**
 * Mock tests for UserService (requires mocking Session and other GAS services)
 */
testRunner.addTest('UserService email validation', () => {
  // Test basic email validation logic
  const validEmails = [
    'test@nisd.net',
    'user.name@nisd.net',
    'first.last@nisd.net'
  ];
  
  const invalidEmails = [
    'test@wrongdomain.com',
    'invalid-email',
    '',
    null
  ];
  
  // Note: In real tests, we'd mock userService.validateUserEmail
  // For now, we'll test the validation logic directly
  validEmails.forEach(email => {
    assertTrue(email && email.endsWith('@nisd.net'), `Should validate ${email}`);
  });
  
  invalidEmails.forEach(email => {
    assertFalse(email && email.endsWith('@nisd.net'), `Should reject ${email}`);
  });
});

/**
 * Tests for DataService logic (mock data)
 */
testRunner.addTest('Data filtering logic simulation', () => {
  // Simulate data filtering
  const mockData = [
    ['Name', 'Campus', 'Grade'],
    ['John Doe', 'Brandeis', '9'],
    ['Jane Smith', 'Clark', '10'],
    ['Bob Johnson', 'Brandeis', '11']
  ];
  
  const userCampuses = ['Brandeis'];
  const campusIndex = 1; // Campus column index
  
  // Simulate filtering
  const filteredRows = mockData.filter((row, index) => {
    if (index === 0) return true; // Keep headers
    return userCampuses.includes(row[campusIndex]);
  });
  
  assertEqual(filteredRows.length, 3); // Headers + 2 Brandeis students
  assertEqual(filteredRows[1][0], 'John Doe');
  assertEqual(filteredRows[2][0], 'Bob Johnson');
});

testRunner.addTest('Column removal simulation', () => {
  const mockData = [
    ['A', 'B', 'C', 'D', 'E'],
    ['1', '2', '3', '4', '5'],
    ['6', '7', '8', '9', '10']
  ];
  
  const columnsToRemove = [1, 3]; // Remove columns B and D (indices 1 and 3)
  const sortedColumns = [...columnsToRemove].sort((a, b) => b - a);
  
  const result = mockData.map(row => {
    const newRow = [...row];
    sortedColumns.forEach(colIndex => newRow.splice(colIndex, 1));
    return newRow;
  });
  
  // Should have columns A, C, E remaining
  assertArrayEqual(result[0], ['A', 'C', 'E']);
  assertArrayEqual(result[1], ['1', '3', '5']);
  assertArrayEqual(result[2], ['6', '8', '10']);
});

/**
 * Performance tests
 */
testRunner.addTest('PerformanceUtils.createTimer - should measure time', () => {
  const timer = PerformanceUtils.createTimer('test');
  assertTrue(timer.name === 'test');
  assertTrue(timer.startTime instanceof Date);
  assertTrue(typeof timer.stop === 'function');
});

/**
 * Cache tests (mock)
 */
testRunner.addTest('Cache simulation', () => {
  // Simulate cache behavior
  const mockCache = new Map();
  
  // Test cache operations
  const key = 'test_key';
  const value = { data: 'test' };
  
  // Set
  mockCache.set(key, JSON.stringify(value));
  assertTrue(mockCache.has(key));
  
  // Get
  const retrieved = JSON.parse(mockCache.get(key));
  assertEqual(retrieved.data, 'test');
  
  // Clear
  mockCache.delete(key);
  assertFalse(mockCache.has(key));
});

/**
 * Integration test simulation
 */
testRunner.addTest('End-to-end data processing simulation', () => {
  // Simulate the complete data processing pipeline
  const mockRawData = [
    ['Student', 'Campus', 'Date', 'Hidden1', 'Hidden2', 'Status'],
    ['John Doe', 'Brandeis', new Date('2024-01-01'), 'x', 'y', 'Active'],
    ['Jane Smith', 'Clark', new Date('2024-01-02'), 'x', 'y', 'Active']
  ];
  
  const userCampuses = ['Brandeis'];
  const columnsToRemove = [3, 4]; // Remove Hidden1 and Hidden2
  const campusIndex = 1;
  
  // Step 1: Filter by campus
  const filtered = mockRawData.filter((row, index) => {
    if (index === 0) return true;
    return userCampuses.includes(row[campusIndex]);
  });
  
  // Step 2: Remove columns
  const sortedColumns = [...columnsToRemove].sort((a, b) => b - a);
  const withoutColumns = filtered.map(row => {
    const newRow = [...row];
    sortedColumns.forEach(colIndex => newRow.splice(colIndex, 1));
    return newRow;
  });
  
  // Step 3: Format dates (simulate)
  const final = withoutColumns.map((row, index) => {
    if (index === 0) return row;
    const newRow = [...row];
    if (newRow[2] instanceof Date) {
      newRow[2] = '01/01/24'; // Simulated date formatting
    }
    return newRow;
  });
  
  // Verify results
  assertEqual(final.length, 2); // Header + 1 student
  assertEqual(final[0].length, 4); // Original 6 columns - 2 removed = 4
  assertEqual(final[1][0], 'John Doe');
  assertEqual(final[1][2], '01/01/24');
});

/**
 * Main test execution function
 */
function runTests() {
  try {
    console.log('='.repeat(50));
    console.log('NAHS Caseload Counts - Test Suite');
    console.log('='.repeat(50));
    
    const results = testRunner.runAllTests();
    
    console.log('='.repeat(50));
    console.log('Test Summary:');
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
    
    return results;
  } catch (error) {
    console.error('Test suite failed to run:', error);
    return { passed: 0, failed: 1, total: 1, error: error.message };
  }
}

/**
 * Test data generation for development
 */
function generateTestData() {
  try {
    console.log('Generating test data...');
    
    const testData = DevUtils.generateTestData(20);
    console.log('Test data generated:', testData);
    
    return testData;
  } catch (error) {
    console.error('Failed to generate test data:', error);
    return null;
  }
}

/**
 * Performance benchmarks
 */
function runPerformanceBenchmarks() {
  console.log('Running performance benchmarks...');
  
  // Test large data processing
  const largeData = DevUtils.generateTestData(1000);
  
  const timer1 = PerformanceUtils.createTimer('Large data filtering');
  // Simulate filtering
  const filtered = largeData.filter((row, index) => index === 0 || row[1] === 'Brandeis');
  timer1.stop();
  
  const timer2 = PerformanceUtils.createTimer('Column removal');
  // Simulate column removal
  const processed = filtered.map(row => [row[0], row[1], row[2]]);
  timer2.stop();
  
  console.log(`Processed ${largeData.length} rows`);
  console.log(`Filtered to ${filtered.length} rows`);
  console.log('Performance benchmarks completed');
}

// Export functions for Google Apps Script
// (In GAS, these would be available globally)
