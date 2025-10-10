import { getArg } from '../utils/helper';
import { cleanUpTempNetworkData } from '../utils/networkMonitor';

/**
 * Global Setup
 */
export default async function globalSetup(): Promise<void> {
  // Set Headed Mode in env
  const headed = getArg('--headed');
  if (headed) {
    process.env.PW_HEADED = headed;
  }

  // Set sharded mode in env
  const shard = getArg('--shard');
  if (shard) {
    process.env.PW_SHARDED = shard;
  }

  // Clear any existing temp network data
  cleanUpTempNetworkData();
}
