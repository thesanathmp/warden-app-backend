import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 Testing Twitter Bearer Token Authentication');
console.log('==============================================\n');

async function testBearerToken() {
  try {
    const { TwitterApi } = await import('twitter-api-v2');
    
    // Check if Bearer Token is available
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    if (!bearerToken) {
      console.log('❌ No Bearer Token found in environment variables');
      console.log('💡 To get a Bearer Token:');
      console.log('   1. Go to Twitter Developer Portal');
      console.log('   2. Select your app');
      console.log('   3. Go to "Keys and Tokens" tab');
      console.log('   4. Under "Authentication Tokens" section');
      console.log('   5. Generate "Bearer Token"');
      console.log('   6. Add to .env: TWITTER_BEARER_TOKEN=your_bearer_token');
      return;
    }

    console.log('✅ Bearer Token found');
    console.log('   Length:', bearerToken.length, '(should be ~100+ chars)');
    console.log('   Starts with:', bearerToken.substring(0, 20) + '...');

    // Test Bearer Token authentication
    console.log('\n📡 Testing Bearer Token connection...');
    const client = new TwitterApi(bearerToken);
    
    try {
      const me = await client.v2.me();
      console.log('✅ SUCCESS! Bearer Token works');
      console.log('   Connected account:', me.data.username);
      console.log('   Account ID:', me.data.id);
      
      // Test posting a simple tweet
      console.log('\n📝 Testing tweet posting...');
      const testTweet = await client.v2.tweet({
        text: '🧪 Test tweet from Karnataka Food Department - ' + new Date().toLocaleTimeString()
      });
      
      console.log('✅ Tweet posted successfully!');
      console.log('   Tweet ID:', testTweet.data.id);
      console.log('   Tweet URL: https://twitter.com/i/web/status/' + testTweet.data.id);
      
    } catch (apiError) {
      console.log('❌ Bearer Token authentication failed:', apiError.message);
      if (apiError.code === 401) {
        console.log('💡 Bearer Token is invalid or expired');
      } else if (apiError.code === 403) {
        console.log('💡 Bearer Token lacks required permissions');
      }
    }

  } catch (error) {
    console.error('❌ Error during Bearer Token test:', error.message);
  }
}

// Also test the new Twitter service
async function testNewTwitterService() {
  console.log('\n🔄 Testing New Twitter Service...');
  try {
    const twitterService = await import('./src/utils/twitter-v2.js');
    const service = twitterService.default;
    
    console.log('Service available:', service.isAvailable());
    console.log('Auth method:', service.getAuthMethod());
    
    const connectionTest = await service.testConnection();
    console.log('Connection test:', connectionTest);
    
  } catch (error) {
    console.error('Error testing new service:', error.message);
  }
}

// Run tests
testBearerToken().then(() => testNewTwitterService());
