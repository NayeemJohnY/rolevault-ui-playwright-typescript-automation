import { getArg } from '../utils/helper';
import { cleanUpTempNetworkData } from '../utils/networkMonitor';

/**
 * Global Setup
 */
export default async function globalSetup(): Promise<void> {
  // Set sharded mode in env
  const shard = getArg('--shard=');
  if (shard) {
    process.env.PW_SHARDED = shard;
  }

  // Clear any existing temp network data
  cleanUpTempNetworkData();
}
