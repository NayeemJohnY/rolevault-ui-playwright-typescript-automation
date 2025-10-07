import { generateNetworkReportCSV } from '../utils/networkMonitor';

export default async function globalTeardown(): Promise<void> {
  await generateNetworkReportCSV();
}
