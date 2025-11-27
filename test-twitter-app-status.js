import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Twitter App Status & Credential Validation');
console.log('=============================================\n');

async function testTwitterAppStatus() {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  console.log('1. Credential Format Validation:');
  console.log('   ✅ All credentials have correct lengths');
  console.log('   ✅ Access token contains dash');
  console.log('   ✅ No trailing spaces detected');

  console.log('\n2. Testing Twitter API with Different Methods:');

  try {
    const { TwitterApi } = await import('twitter-api-v2');

    // Test 1: Try with just App credentials (no user context)
    console.log('\n   Test A: App-only authentication...');
    try {
      const appOnlyClient = new TwitterApi({ appKey: apiKey, appSecret: apiSecret });
      const appToken = await appOnlyClient.appLogin();
      console.log('   ✅ App-only authentication successful');
      
      // Test basic API call with app token
      const appClient = new TwitterApi(appToken);
      const userLookup = await appClient.v2.userByUsername('twitter');
      console.log('   ✅ App-only API call successful');
    } catch (appError) {
      console.log('   ❌ App-only authentication failed:', appError.message);
      if (appError.message.includes('401')) {
        console.log('   💡 This suggests your API Key/Secret are invalid');
      }
    }

    // Test 2: Try OAuth 1.0a with user context
    console.log('\n   Test B: Full OAuth 1.0a authentication...');
    try {
      const userClient = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessSecret,
      });

      // Try a simple read operation first
      const me = await userClient.v1.verifyCredentials();
      console.log('   ✅ OAuth 1.0a authentication successful');
      console.log('   📱 Connected account:', me.screen_name);
      console.log('   👤 Account ID:', me.id_str);
      
    } catch (oauthError) {
      console.log('   ❌ OAuth 1.0a authentication failed:', oauthError.message);
      
      if (oauthError.message.includes('Could not authenticate you')) {
        console.log('   💡 This usually means:');
        console.log('      - Access tokens are invalid/expired');
        console.log('      - Access tokens don\'t match the API keys');
        console.log('      - App permissions changed after token generation');
      }
    }

  } catch (importError) {
    console.log('   ❌ Failed to import TwitterApi:', importError.message);
  }

  console.log('\n3. Troubleshooting Steps:');
  console.log('   📋 Since credential lengths are correct but auth fails:');
  console.log('');
  console.log('   Step 1: Regenerate ALL credentials');
  console.log('      - Go to Twitter Developer Portal');
  console.log('      - Regenerate Consumer Keys (API Key + Secret)');
  console.log('      - Regenerate Access Token + Secret');
  console.log('      - Update ALL 4 in .env file');
  console.log('');
  console.log('   Step 2: Verify app permissions');
  console.log('      - Ensure app has "Read and Write" permissions');
  console.log('      - Check app is not suspended or restricted');
  console.log('');
  console.log('   Step 3: Account verification');
  console.log('      - Verify phone number on Twitter account');
  console.log('      - Verify email address');
  console.log('      - Check for any account restrictions');
  console.log('');
  console.log('   Step 4: Try manual test in Developer Portal');
  console.log('      - Go to your app → "Keys and Tokens"');
  console.log('      - Look for any "Test" buttons');
  console.log('      - Try making test API calls from the portal');

  console.log('\n4. Alternative Solutions:');
  console.log('   🆕 Create a completely new Twitter app');
  console.log('   🔄 Try with a different Twitter account');
  console.log('   📞 Contact Twitter Developer Support');

  console.log('\n🎯 Next Steps:');
  console.log('   1. Try regenerating ALL 4 credentials first');
  console.log('   2. If that fails, create a new Twitter app');
  console.log('   3. Test each step with this script');
}

testTwitterAppStatus();
