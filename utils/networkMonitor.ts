import type { Page, Request, Response, TestInfo } from '@playwright/test';
import * as fs from 'fs';
import path from 'path';

const TEMP_NETWORK_DATA_DIR = path.join(process.cwd(), 'network-reports', 'temp-network-data');

export interface HttpRequestRecord {
  /** Timestamp when the request was made */
  timestamp: Date;
  /** Project Name */
  projectName: string;
  /**Test File Name */
  testFile: string;
  /** Test Suite (Describe) */
  testSuite: string;
  /**Test Title */
  testTitle: string;
  /** HTTP method (GET, POST, PUT, DELETE, etc.) */
  method: string;
  /** Full URL of the API endpoint */
  url: string;
  /** HTTP status code of the response */
  statusCode: number;
  /** Response time in milliseconds */
  responseTimeInMs: number;
}

export function createRequestRecordFromResponse(
  testInfo: TestInfo,
  response: Response | null
): HttpRequestRecord | undefined {
  try {
    if (response) {
      const [testFile, testSuite, testTitle] = testInfo.titlePath;
      const timing = response.request().timing();
      return {
        timestamp: new Date(),
        projectName: testInfo.project.name,
        testFile,
        testSuite,
        testTitle,
        method: response.request().method(),
        url: response.url(),
        statusCode: response.status(),
        responseTimeInMs: Math.round(timing.responseEnd - timing.requestStart),
      };
    }
  } catch (error) {
    console.warn('Error collecting network data:', error);
  }
}

export function createRequestRecordFromFailedRequest(
  testInfo: TestInfo,
  request: Request
): HttpRequestRecord | undefined {
  try {
    const timing = request.timing();
    const [testFile, testSuite, testTitle] = testInfo.titlePath;
    return {
      timestamp: new Date(),
      projectName: testInfo.project.name,
      testFile,
      testSuite,
      testTitle,
      method: request.method(),
      url: request.url(),
      statusCode: 0,
      responseTimeInMs: Math.round(timing.responseEnd - timing.requestStart),
    };
  } catch (error) {
    console.warn('Error collecting network data:', error);
  }
}

export function saveTestNetworkData(testInfo: TestInfo, httpRequestRecords: HttpRequestRecord[]): string | undefined {
  try {
    const tempDir = path.join(process.cwd(), 'network-reports', 'temp-network-data');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create unique filename for this test
    const testTitleName = `${testInfo.title}`.replace(/[^a-zA-Z0-9]/g, '_');
    const workerIndex = testInfo.parallelIndex || 0;
    const timestamp = Date.now();
    const fileName = `test_${workerIndex}_${testTitleName}_${timestamp}.json`;
    const filePath = path.join(tempDir, fileName);

    const httpRequestRecordsData = JSON.stringify(httpRequestRecords, null, 2);
    fs.writeFileSync(filePath, httpRequestRecordsData);
    return httpRequestRecordsData;
  } catch (error) {
    console.warn('Error saving test network data:', error);
  }
}

/**
 * Convert HTTP Request Records data to CSV format
 */
function convertRequestRecordsToCSV(data: HttpRequestRecord[]): string {
  if (data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]).map((header) => header.toUpperCase());
  const csvRows: string[] = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = Object.values(row).map((value) => {
      // Handle commas and quotes in CSV values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

export function cleanUpTempNetworkData(): void {
  if (process.env.PW_SHARDED) {
    console.log('Skipping Cleanup in sharded mode. Consider manual cleanup');
    return;
  }

  if (fs.existsSync(TEMP_NETWORK_DATA_DIR)) {
    // Clean up any existing temp files
    const files = fs.readdirSync(TEMP_NETWORK_DATA_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(TEMP_NETWORK_DATA_DIR, file));
    }
    fs.rmdirSync(TEMP_NETWORK_DATA_DIR);
  }
}

export function generateNetworkReportCSV(): void {
  if (process.env.PW_SHARDED) {
    console.log('Skipping Network report generation in sharded mode. Use manual report generation script');
    return;
  }

  const NETWORK_DATA_DIR = process.env.TEMP_NETWORK_DATA_DIR || TEMP_NETWORK_DATA_DIR;

  try {
    if (!fs.existsSync(NETWORK_DATA_DIR)) {
      console.log('No network data files found');
      return;
    }

    // Read all JSON files (no parsing overhead)
    const jsonFiles = fs.readdirSync(NETWORK_DATA_DIR).filter((file) => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.log('No network data to merge');
      return;
    }
    console.log(`\n📊 Merging ${jsonFiles.length} network data files...`);

    const allHttpRequestRecords: HttpRequestRecord[] = [];

    // Simply concatenate all JSON arrays (super fast)
    for (const jsonFile of jsonFiles) {
      const filePath = path.join(NETWORK_DATA_DIR, jsonFile);
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8')) as HttpRequestRecord[];
      allHttpRequestRecords.push(...fileData);
    }

    if (allHttpRequestRecords.length === 0) {
      console.log('No valid network data found');
      return;
    }

    // Create final reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportsDir = path.join(process.cwd(), 'network-reports');

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Export CSV (only done once at the end)
    const csvContent = convertRequestRecordsToCSV(allHttpRequestRecords);
    const csvPath = path.join(reportsDir, `network-report-${timestamp}.csv`);
    fs.writeFileSync(csvPath, csvContent);
    console.log('✅ Network report generation completed');
    cleanUpTempNetworkData();
  } catch (error) {
    console.error('❌ Error in global teardown:', error);
  }
}

/**
 * Sets up network monitoring for a page and returns collected data
 * This function encapsulates all the network monitoring logic
 */
export async function setupNetworkMonitoring(
  page: Page,
  testInfo: TestInfo
): Promise<{ getNetworkData: () => HttpRequestRecord[]; attachReport: () => Promise<void> }> {
  const httpRequestRecords: HttpRequestRecord[] = [];
  // Set up request finished listener
  page.on('requestfinished', async (request) => {
    try {
      const response = await request.response();
      const httpRequestRecord = createRequestRecordFromResponse(testInfo, response);
      if (httpRequestRecord) {
        httpRequestRecords.push(httpRequestRecord);
      }
    } catch (error) {
      console.warn('Error processing finished request:', error);
    }
  });
  // Set up request failed listener
  page.on('requestfailed', async (request) => {
    try {
      const httpRequestRecord = createRequestRecordFromFailedRequest(testInfo, request);
      if (httpRequestRecord) {
        httpRequestRecords.push(httpRequestRecord);
      }
    } catch (error) {
      console.warn('Error processing failed request:', error);
    }
  });
  return {
    getNetworkData: () => httpRequestRecords,
    attachReport: async (): Promise<void> => {
      const networkRequestJSON = saveTestNetworkData(testInfo, httpRequestRecords);
      if (networkRequestJSON) {
        await testInfo.attach('Network Requests JSON Report', {
          body: networkRequestJSON,
          contentType: 'application/json',
        });
      }
    },
  };
}

// Direct execution support
if (require.main === module) {
  try {
    console.log('🚀 Generating network report...');
    generateNetworkReportCSV();
  } catch (error) {
    console.error('❌ Error generating network report:', error);
  }
}
