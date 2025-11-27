import { TwitterApi } from 'twitter-api-v2';

class TwitterServiceV2 {
  constructor() {
    this.client = null;
    this.isEnabled = false;
    this.authMethod = null;
    this.init();
  }

  init() {
    try {
      // Method 1: Try Bearer Token (OAuth 2.0) - Simpler and often more reliable
      const bearerToken = process.env.TWITTER_BEARER_TOKEN;
      
      if (bearerToken) {
        console.log('Attempting Twitter authentication with Bearer Token...');
        this.client = new TwitterApi(bearerToken);
        this.authMethod = 'bearer';
        this.isEnabled = true;
        console.log('Twitter API initialized successfully with Bearer Token');
        return;
      }

      // Method 2: Try OAuth 1.0a (API Key + Secret + Access Token + Secret)
      const appKey = process.env.TWITTER_API_KEY;
      const appSecret = process.env.TWITTER_API_SECRET;
      const accessToken = process.env.TWITTER_ACCESS_TOKEN;
      const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

      if (appKey && appSecret && accessToken && accessSecret) {
        console.log('Attempting Twitter authentication with OAuth 1.0a...');
        
        // Validate credential lengths
        if (appSecret.length < 40) {
          console.warn(`API Secret seems too short (${appSecret.length} chars). Should be ~50 chars.`);
          console.warn('Please check you copied the correct API Secret from Twitter Developer Portal.');
        }

        this.client = new TwitterApi({
          appKey,
          appSecret,
          accessToken,
          accessSecret,
        });
        this.authMethod = 'oauth1';
        this.isEnabled = true;
        console.log('Twitter API initialized successfully with OAuth 1.0a');
        return;
      }

      console.warn('Twitter API credentials not found. Twitter posting disabled.');
      console.warn('Need either:');
      console.warn('  - TWITTER_BEARER_TOKEN (recommended for posting)');
      console.warn('  - OR all 4: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET');
      
    } catch (error) {
      console.error('Failed to initialize Twitter API:', error.message);
      this.isEnabled = false;
    }
  }

  /**
   * Download image from URL and return buffer
   */
  async downloadImage(imageUrl) {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }
      return await response.buffer();
    } catch (error) {
      console.error('Error downloading image:', error.message);
      throw error;
    }
  }

  /**
   * Upload media to Twitter and return media ID
   */
  async uploadMedia(imageBuffer, mimeType = 'image/jpeg') {
    try {
      if (!this.isEnabled) {
        throw new Error('Twitter API not initialized');
      }

      // Media upload requires OAuth 1.0a (v1.1 API)
      if (this.authMethod === 'bearer') {
        throw new Error('Media upload requires OAuth 1.0a credentials, not Bearer Token');
      }

      // Upload media using v1.1 API
      const mediaId = await this.client.v1.uploadMedia(imageBuffer, { mimeType });
      console.log('Media uploaded to Twitter:', mediaId);
      return mediaId;
    } catch (error) {
      console.error('Error uploading media to Twitter:', error.message);
      throw error;
    }
  }

  /**
   * Create a tweet with media (OAuth 1.0a method)
   */
  async postTweetWithMediaOAuth(text, mediaIds) {
    try {
      if (!this.isEnabled || this.authMethod !== 'oauth1') {
        throw new Error('OAuth 1.0a authentication required for media posting');
      }

      const tweet = await this.client.v2.tweet({
        text,
        media: { media_ids: mediaIds }
      });

      console.log('Tweet posted successfully:', tweet.data.id);
      return tweet.data;
    } catch (error) {
      console.error('Error posting tweet with media:', error.message);
      throw error;
    }
  }

  /**
   * Create a text-only tweet (Bearer Token method)
   */
  async postTextTweet(text) {
    try {
      if (!this.isEnabled) {
        throw new Error('Twitter API not initialized');
      }

      const tweet = await this.client.v2.tweet({ text });
      console.log('Text tweet posted successfully:', tweet.data.id);
      return tweet.data;
    } catch (error) {
      console.error('Error posting text tweet:', error.message);
      throw error;
    }
  }

  /**
   * Post warden photo to Twitter
   */
  async postWardenPhoto(photoData) {
    try {
      if (!this.isEnabled) {
        console.log('Twitter posting disabled - skipping');
        return null;
      }

      const { schoolName, mealType, photoUrl, wardenName, timestamp } = photoData;

      // Create tweet text
      const mealTypeFormatted = this.formatMealType(mealType);
      const timeFormatted = new Date(timestamp).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      const tweetText = `🍽️ ${mealTypeFormatted} served at ${schoolName}

📸 Photo by: ${wardenName}
📅 ${timeFormatted}

#MidDayMeal #KarnatakaEducation #FoodSafety #SchoolNutrition #DepartmentOfFood`;

      // Try to post with media if OAuth 1.0a is available
      if (this.authMethod === 'oauth1') {
        try {
          // Download and upload image
          const imageBuffer = await this.downloadImage(photoUrl);
          const mediaId = await this.uploadMedia(imageBuffer);
          
          // Post tweet with media
          const result = await this.postTweetWithMediaOAuth(tweetText, [mediaId]);
          console.log('Warden photo posted to Twitter successfully with image');
          return result;
        } catch (mediaError) {
          console.warn('Failed to post with media, falling back to text-only:', mediaError.message);
          // Fall through to text-only posting
        }
      }

      // Fallback: Post text-only tweet with photo URL
      const textOnlyTweet = tweetText + `\n\n📷 Photo: ${photoUrl}`;
      const result = await this.postTextTweet(textOnlyTweet);
      console.log('Warden photo posted to Twitter successfully (text-only)');
      return result;

    } catch (error) {
      console.error('Error posting warden photo to Twitter:', error.message);
      return null;
    }
  }

  /**
   * Format meal type for display
   */
  formatMealType(mealType) {
    const mealTypes = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      snacks: 'Evening Snacks',
      dinner: 'Dinner'
    };
    return mealTypes[mealType] || mealType;
  }

  /**
   * Test Twitter connection
   */
  async testConnection() {
    try {
      if (!this.isEnabled) {
        return { success: false, error: 'Twitter API not initialized' };
      }

      if (this.authMethod === 'bearer') {
        // Test with Bearer Token
        const me = await this.client.v2.me();
        return { 
          success: true, 
          method: 'Bearer Token',
          account: me.data.username,
          capabilities: ['text tweets', 'read data']
        };
      } else {
        // Test with OAuth 1.0a
        const me = await this.client.v2.me();
        return { 
          success: true, 
          method: 'OAuth 1.0a',
          account: me.data.username,
          capabilities: ['text tweets', 'media upload', 'full access']
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        method: this.authMethod 
      };
    }
  }

  /**
   * Check if Twitter service is available
   */
  isAvailable() {
    return this.isEnabled;
  }

  /**
   * Get authentication method being used
   */
  getAuthMethod() {
    return this.authMethod;
  }
}

// Create singleton instance
const twitterService = new TwitterServiceV2();

export default twitterService;
