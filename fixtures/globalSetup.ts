import { cleanUpTempNetworkData } from '../utils/networkMonitor';

/**
 * Global Setup
 */
export default async function globalSetup(): Promise<void> {
  // Set HEADED mode in env
  const headed = process.argv.includes('--headed') || process.env.PWDEBUG === '1';
  process.env.PW_HEADED = headed ? '1' : undefined;

  // Set sharded mode in env
  const sharded = process.argv.includes('--shard');
  process.env.PW_SHARDED = sharded ? '1' : undefined;

  // Clear any existing temp network data
  cleanUpTempNetworkData();
  console.log('🧹 Cleaned up temporary files');
}
