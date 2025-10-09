import { getArg } from '../utils/helper';
import { cleanUpTempNetworkData } from '../utils/networkMonitor';

/**
 * Global Setup
 */
export default async function globalSetup(): Promise<void> {
  // Set sharded mode in env
  process.env.PW_SHARDED = getArg('--shard=') ? '1' : undefined;

  // Clear any existing temp network data
  cleanUpTempNetworkData();
  console.log('🧹 Cleaned up temporary files');
}
