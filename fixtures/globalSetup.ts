import { cleanUpTempNetworkData } from '../utils/networkMonitor';

/**
 * Global Setup
 */
export default async function globalSetup(): Promise<void> {
  //Clear any existing temp network data
  cleanUpTempNetworkData();
  console.log('🧹 Cleaned up temporary files');
}
