import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import { testCases, testPlanName, testSuiteName } from './test-plan-suite.json';
import path from 'path';

const TEST_RESULTS_JSON_PATH = path.join(process.cwd(), 'custom-reporter', 'test-results-report.json');

type TestOutcome = 'Passed' | 'Failed' | 'Error' | 'Unspecified' | 'Inconclusive';

const statusMap: Record<string, TestOutcome> = {
  passed: 'Passed',
  failed: 'Failed',
  skipped: 'Error',
  unspecified: 'Unspecified',
};

type IterationDetails = {
  id: number;
  outcome: TestOutcome;
  durationInMs: number;
  comment: string;
  errorMessage?: string;
};

type TestResults = {
  [testCaseId: string]: {
    outcome: TestOutcome;
    durationInMs: number;
    comment: string;
    errorMessage?: string;
    iterationDetails?: IterationDetails[];
  };
};

function stripAnsiCodes(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\u001b\[\d+m/g, '');
}

class TestResultsReporter implements Reporter {
  testResults: TestResults = {};

  onTestEnd(test: TestCase, result: TestResult): void {
    const testCaseId = testCases[test.title as keyof typeof testCases].testCaseId;
    const status = statusMap[result.status || 'unspecified'];
    const projectName = test.parent.project()?.name || 'default';
    const cleanErrorMessage = result.error?.message ? stripAnsiCodes(result.error.message) : undefined;

    const currentResult = {
      comment: `Project: ${projectName} <=> Test Name: ${test.title}`,
      outcome: status,
      durationInMs: result.duration,
      errorMessage: cleanErrorMessage,
    };

    const existingResult = this.testResults[testCaseId];

    // First execution - no existing result
    if (!existingResult) {
      this.testResults[testCaseId] = currentResult;
      return;
    }

    // Calculate combined outcome
    const combinedOutcome = existingResult.outcome !== status ? 'Inconclusive' : status;
    const totalDuration = existingResult.durationInMs + result.duration;

    // Second execution - convert to iterations
    if (!existingResult.iterationDetails) {
      this.testResults[testCaseId] = {
        comment: `Test Name: ${test.title}`,
        outcome: combinedOutcome,
        durationInMs: totalDuration,
        errorMessage: '',
        iterationDetails: [
          { id: 1, ...existingResult },
          { id: 2, ...currentResult },
        ],
      };
      return;
    }

    // Third+ execution - add to existing iterations
    existingResult.iterationDetails.push({
      id: existingResult.iterationDetails.length + 1,
      ...currentResult,
    });
    existingResult.outcome = combinedOutcome;
    existingResult.durationInMs = totalDuration;
  }

  onEnd(result: FullResult): void {
    console.log(`Final Suite Status - ${result.status.toUpperCase()}`);
    console.log('Generated Test Results Report JSON');
    try {
      const report = { testPlanName, testSuiteName, testResults: this.testResults };
      fs.writeFileSync(TEST_RESULTS_JSON_PATH, JSON.stringify(report, null, 2));
    } catch (error) {
      console.error('Error occurred while generating Test Result Report JSON', error);
    }
  }
}

export default TestResultsReporter;
