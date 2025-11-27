import dotenv from 'dotenv';
dotenv.config();

console.log('🔧 Fixing OAuth 1.0a Credentials');
console.log('=================================\n');

console.log('Current credential analysis:');
const apiKey = process.env.TWITTER_API_KEY;
const apiSecret = process.env.TWITTER_API_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

console.log('✅ API Key:', apiKey?.length, 'chars -', apiKey ? 'OK' : 'MISSING');
console.log('❌ API Secret:', apiSecret?.length, 'chars - TOO SHORT! Should be ~50');
console.log('✅ Access Token:', accessToken?.length, 'chars -', accessToken?.includes('-') ? 'OK (has dash)' : 'Missing dash');
console.log('✅ Access Secret:', accessSecret?.length, 'chars -', accessSecret ? 'OK' : 'MISSING');

console.log('\n🎯 THE PROBLEM:');
console.log('Your API Secret is only', apiSecret?.length, 'characters but should be ~50 characters.');
console.log('This means you copied the wrong value from Twitter Developer Portal.');

console.log('\n📋 TO FIX:');
console.log('1. Go to: https://developer.twitter.com/en/portal/dashboard');
console.log('2. Select your app');
console.log('3. Go to "Keys and Tokens" tab');
console.log('4. Under "Consumer Keys" section:');
console.log('   - API Key: Should be ~25 chars (you have this correct)');
console.log('   - API Secret: Should be ~50 chars (you need to copy this again)');
console.log('5. Make sure you copy the FULL API Secret, not just part of it');

console.log('\n🔍 What to look for:');
console.log('- API Secret should start with letters/numbers');
console.log('- Should be much longer than your current one');
console.log('- No spaces or special formatting');

console.log('\n✅ Once fixed, your .env should look like:');
console.log('TWITTER_API_KEY=' + (apiKey || 'your_25_char_api_key'));
console.log('TWITTER_API_SECRET=your_50_char_api_secret_here_much_longer_than_current');
console.log('TWITTER_ACCESS_TOKEN=' + (accessToken || 'your_access_token_with_dash'));
console.log('TWITTER_ACCESS_TOKEN_SECRET=' + (accessSecret || 'your_access_token_secret'));

console.log('\n🧪 After fixing, test with:');
console.log('node advanced-twitter-debug.js');
