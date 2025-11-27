import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 Testing Twitter Photo Posting');
console.log('=================================\n');

async function testTwitterPost() {
  try {
    // Import Twitter service
    const twitterServiceModule = await import('./src/utils/twitter.js');
    const twitterService = twitterServiceModule.default;

    console.log('Twitter service available:', twitterService.isAvailable());

    if (!twitterService.isAvailable()) {
      console.log('❌ Twitter service not available. Check your credentials in .env file');
      return;
    }

    // Test data (similar to what would come from a real upload)
    const testPhotoData = {
      schoolName: 'Test Government Primary School',
      mealType: 'lunch',
      photoUrl: 'https://via.placeholder.com/800x600/4CAF50/white?text=Test+Meal+Photo', // Test image URL
      wardenName: 'Test Warden',
      timestamp: new Date()
    };

    console.log('📤 Attempting to post test photo to Twitter...');
    console.log('Test data:', testPhotoData);
    console.log();

    const result = await twitterService.postWardenPhoto(testPhotoData);

    if (result) {
      console.log('✅ SUCCESS! Tweet posted successfully');
      console.log('Tweet ID:', result.id);
      console.log('Tweet URL: https://twitter.com/i/web/status/' + result.id);
    } else {
      console.log('❌ FAILED! No result returned (check logs above for errors)');
    }

  } catch (error) {
    console.error('❌ ERROR during test:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testTwitterPost();
