import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 Simple Twitter Authentication Test');
console.log('====================================\n');

async function testTwitterAuth() {
  try {
    const { TwitterApi } = await import('twitter-api-v2');
    
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

    console.log('Credential Check:');
    console.log('✅ API Key:', apiKey?.length, 'chars');
    console.log('✅ API Secret:', apiSecret?.length, 'chars');
    console.log('✅ Access Token:', accessToken?.length, 'chars');
    console.log('✅ Access Secret:', accessSecret?.length, 'chars');
    console.log();

    // Test 1: App-only authentication (tests API Key/Secret)
    console.log('Test 1: App-only authentication...');
    try {
      const appClient = new TwitterApi({ appKey: apiKey, appSecret: apiSecret });
      const appToken = await appClient.appLogin();
      console.log('✅ SUCCESS: API Key and Secret are valid');
      
      // Test a simple API call
      const client = new TwitterApi(appToken);
      const user = await client.v2.userByUsername('twitter');
      console.log('✅ SUCCESS: App-only API call works');
      
    } catch (appError) {
      console.log('❌ FAILED: App-only auth failed');
      console.log('   Error:', appError.message);
      console.log('   💡 This means your API Key or API Secret is wrong');
      return;
    }

    // Test 2: Full OAuth authentication (tests all 4 credentials)
    console.log('\nTest 2: Full OAuth authentication...');
    try {
      const userClient = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessSecret,
      });

      const me = await userClient.v1.verifyCredentials();
      console.log('✅ SUCCESS: All credentials are valid!');
      console.log('📱 Connected to account:', me.screen_name);
      console.log('👤 User ID:', me.id_str);
      console.log('🎉 Twitter integration is ready to work!');
      
    } catch (oauthError) {
      console.log('❌ FAILED: OAuth authentication failed');
      console.log('   Error:', oauthError.message);
      console.log('   💡 This means your Access Token or Access Token Secret is wrong');
      console.log('   💡 Or the tokens don\'t match your API keys');
    }

  } catch (error) {
    console.log('❌ Script error:', error.message);
  }
}

console.log('🔧 If authentication fails, try this:');
console.log('1. Go to Twitter Developer Portal');
console.log('2. Regenerate ALL 4 credentials');
console.log('3. Update your .env file');
console.log('4. Run this test again');
console.log();

testTwitterAuth();
