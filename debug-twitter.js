import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Twitter Integration Debug Script');
console.log('=====================================\n');

// Check environment variables
console.log('1. Checking Environment Variables:');
console.log('   TWITTER_API_KEY:', process.env.TWITTER_API_KEY ? '✅ Set' : '❌ Missing');
console.log('   TWITTER_API_SECRET:', process.env.TWITTER_API_SECRET ? '✅ Set' : '❌ Missing');
console.log('   TWITTER_ACCESS_TOKEN:', process.env.TWITTER_ACCESS_TOKEN ? '✅ Set' : '❌ Missing');
console.log('   TWITTER_ACCESS_TOKEN_SECRET:', process.env.TWITTER_ACCESS_TOKEN_SECRET ? '✅ Set' : '❌ Missing');
console.log('   TWITTER_ENABLED:', process.env.TWITTER_ENABLED || 'Not set (defaults to true)');
console.log();

// Test Twitter service import
console.log('2. Testing Twitter Service Import:');
try {
  const twitterService = await import('./src/utils/twitter.js');
  console.log('   ✅ Twitter service imported successfully');
  
  const service = twitterService.default;
  console.log('   Twitter service enabled:', service.isAvailable() ? '✅ Yes' : '❌ No');
  
  if (service.isAvailable()) {
    console.log('   ✅ Twitter API client initialized');
    
    // Test a simple API call (get user info)
    try {
      const me = await service.client.v2.me();
      console.log('   ✅ Twitter API connection successful');
      console.log('   📱 Connected account:', me.data.username);
    } catch (apiError) {
      console.log('   ❌ Twitter API connection failed:', apiError.message);
      if (apiError.code === 401) {
        console.log('   💡 This usually means invalid credentials');
      }
    }
  } else {
    console.log('   ❌ Twitter service not enabled (check credentials)');
  }
} catch (importError) {
  console.log('   ❌ Failed to import Twitter service:', importError.message);
}

console.log();

// Test photo controller import
console.log('3. Testing Photo Controller Integration:');
try {
  const photoController = await import('./src/controllers/photoController.js');
  console.log('   ✅ Photo controller imported successfully');
} catch (importError) {
  console.log('   ❌ Failed to import photo controller:', importError.message);
}

console.log();

// Check if packages are installed
console.log('4. Checking Required Packages:');
try {
  await import('twitter-api-v2');
  console.log('   ✅ twitter-api-v2 package installed');
} catch {
  console.log('   ❌ twitter-api-v2 package missing - run: npm install twitter-api-v2');
}

try {
  await import('node-fetch');
  console.log('   ✅ node-fetch package installed');
} catch {
  console.log('   ❌ node-fetch package missing - run: npm install node-fetch');
}

console.log();

// Provide recommendations
console.log('5. Recommendations:');
if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET || 
    !process.env.TWITTER_ACCESS_TOKEN || !process.env.TWITTER_ACCESS_TOKEN_SECRET) {
  console.log('   📝 Add Twitter API credentials to your .env file');
  console.log('   📝 Get credentials from: https://developer.twitter.com/en/portal/dashboard');
}

console.log('   📝 Check server logs when uploading photos for Twitter-related messages');
console.log('   📝 Look for "Attempting to post to Twitter" or "Twitter posting failed" messages');
console.log();

console.log('🎯 Debug complete! Check the results above to identify the issue.');
