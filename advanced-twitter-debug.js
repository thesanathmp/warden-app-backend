import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Advanced Twitter 401 Debug');
console.log('==============================\n');

// Check credential format and validity
console.log('1. Detailed Credential Analysis:');
const apiKey = process.env.TWITTER_API_KEY;
const apiSecret = process.env.TWITTER_API_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

console.log('   API Key length:', apiKey?.length || 0, '(should be ~25 chars)');
console.log('   API Secret length:', apiSecret?.length || 0, '(should be ~50 chars)');
console.log('   Access Token length:', accessToken?.length || 0, '(should be ~50 chars)');
console.log('   Access Secret length:', accessSecret?.length || 0, '(should be ~45 chars)');

console.log('   API Key starts with:', apiKey?.substring(0, 5) + '...' || 'N/A');
console.log('   Access Token format:', accessToken?.includes('-') ? '✅ Contains dash' : '❌ Missing dash');

// Check for common issues
console.log('\n2. Common Issues Check:');
console.log('   Hidden characters:', JSON.stringify({apiKey: apiKey?.substring(0,10)}));
console.log('   Trailing spaces:', apiKey?.endsWith(' ') ? '❌ Has trailing space' : '✅ No trailing space');

console.log('\n3. Testing Different API Approaches:');

try {
  const { TwitterApi } = await import('twitter-api-v2');
  
  // Test 1: Basic client initialization
  console.log('   Test 1: Basic client creation...');
  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: accessToken,
    accessSecret: accessSecret,
  });
  console.log('   ✅ Client created successfully');

  // Test 2: Try v1.1 API first (sometimes more reliable)
  console.log('   Test 2: Testing v1.1 API...');
  try {
    const v1Client = client.v1;
    const verifyResult = await v1Client.verifyCredentials();
    console.log('   ✅ v1.1 API works! Account:', verifyResult.screen_name);
  } catch (v1Error) {
    console.log('   ❌ v1.1 API failed:', v1Error.message);
    if (v1Error.code === 401) {
      console.log('   💡 401 on v1.1 suggests credential issue');
    }
  }

  // Test 3: Try v2 API
  console.log('   Test 3: Testing v2 API...');
  try {
    const me = await client.v2.me();
    console.log('   ✅ v2 API works! Account:', me.data.username);
  } catch (v2Error) {
    console.log('   ❌ v2 API failed:', v2Error.message);
    if (v2Error.code === 401) {
      console.log('   💡 401 on v2 suggests credential or scope issue');
    }
  }

  // Test 4: Check rate limits
  console.log('   Test 4: Checking rate limit status...');
  try {
    const rateLimits = await client.v1.getRateLimits();
    console.log('   ✅ Rate limit check successful');
  } catch (rateLimitError) {
    console.log('   ❌ Rate limit check failed:', rateLimitError.message);
  }

} catch (importError) {
  console.log('   ❌ Failed to import TwitterApi:', importError.message);
}

console.log('\n4. Credential Validation Tips:');
console.log('   📝 Try regenerating ALL 4 credentials (not just access tokens)');
console.log('   📝 Ensure no extra quotes or spaces in .env file');
console.log('   📝 Check if Twitter app is suspended or restricted');
console.log('   📝 Verify the Twitter account has phone number verified');
console.log('   📝 Try creating a completely new Twitter app');

console.log('\n5. Alternative Authentication Test:');
console.log('   Try this manual test in Twitter Developer Portal:');
console.log('   1. Go to your app → "Keys and Tokens"');
console.log('   2. Click "Test" button next to access tokens');
console.log('   3. Should show success if credentials are valid');

console.log('\n🎯 Debug complete!');
