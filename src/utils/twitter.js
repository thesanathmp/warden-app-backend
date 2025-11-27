import { TwitterApi } from 'twitter-api-v2';

class TwitterService {
  constructor() {
    this.client = null;
    this.isEnabled = false;
    this.init();
  }

  init() {
    try {
      // Check if Twitter credentials are available
      const appKey = process.env.TWITTER_API_KEY;
      const appSecret = process.env.TWITTER_API_SECRET;
      const accessToken = process.env.TWITTER_ACCESS_TOKEN;
      const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

      if (!appKey || !appSecret || !accessToken || !accessSecret) {
        console.warn('Twitter API credentials not found. Twitter posting disabled.');
        return;
      }

      // Initialize Twitter client with v1.1 for media upload and v2 for posting
      this.client = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
      });

      this.isEnabled = true;
      console.log('Twitter API initialized successfully');
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
      // Use dynamic import for fetch to ensure compatibility
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

      // Upload media using v1.1 API (required for media upload)
      const mediaId = await this.client.v1.uploadMedia(imageBuffer, { mimeType });
      console.log('Media uploaded to Twitter:', mediaId);
      return mediaId;
    } catch (error) {
      console.error('Error uploading media to Twitter:', error.message);
      throw error;
    }
  }

  /**
   * Create a tweet with media
   */
  async postTweetWithMedia(text, mediaIds) {
    try {
      if (!this.isEnabled) {
        throw new Error('Twitter API not initialized');
      }

      // Post tweet using v2 API
      const tweet = await this.client.v2.tweet({
        text,
        media: { media_ids: mediaIds }
      });

      console.log('Tweet posted successfully:', tweet.data.id);
      return tweet.data;
    } catch (error) {
      console.error('Error posting tweet:', error.message);
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

      // Download the image
      const imageBuffer = await this.downloadImage(photoUrl);

      // Upload media to Twitter
      const mediaId = await this.uploadMedia(imageBuffer);

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

      // Post tweet with media
      const result = await this.postTweetWithMedia(tweetText, [mediaId]);

      console.log('Warden photo posted to Twitter successfully');
      return result;
    } catch (error) {
      console.error('Error posting warden photo to Twitter:', error.message);
      // Don't throw error to avoid breaking the main upload flow
      return null;
    }
  }

  /**
   * Post multiple photos from same meal session
   */
  async postMultipleWardenPhotos(photosData) {
    try {
      if (!this.isEnabled) {
        console.log('Twitter posting disabled - skipping');
        return null;
      }

      if (!photosData || photosData.length === 0) {
        return null;
      }

      // Group photos by school and meal type
      const groupedPhotos = this.groupPhotosBySession(photosData);

      const results = [];
      for (const sessionKey in groupedPhotos) {
        const sessionPhotos = groupedPhotos[sessionKey];
        
        // Limit to 4 photos per tweet (Twitter limit)
        const photosToPost = sessionPhotos.slice(0, 4);
        
        try {
          // Download and upload all images
          const mediaIds = [];
          for (const photo of photosToPost) {
            const imageBuffer = await this.downloadImage(photo.photoUrl);
            const mediaId = await this.uploadMedia(imageBuffer);
            mediaIds.push(mediaId);
          }

          // Create tweet text for multiple photos
          const firstPhoto = photosToPost[0];
          const mealTypeFormatted = this.formatMealType(firstPhoto.mealType);
          const timeFormatted = new Date(firstPhoto.timestamp).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
          });

          const tweetText = `🍽️ ${mealTypeFormatted} at ${firstPhoto.schoolName}

📸 ${photosToPost.length} photos by: ${firstPhoto.wardenName}
📅 ${timeFormatted}

#MidDayMeal #KarnatakaEducation #FoodSafety #SchoolNutrition #DepartmentOfFood`;

          // Post tweet with all media
          const result = await this.postTweetWithMedia(tweetText, mediaIds);
          results.push(result);

          // Add delay between posts to respect rate limits
          if (Object.keys(groupedPhotos).length > 1) {
            await this.delay(2000); // 2 second delay
          }
        } catch (error) {
          console.error(`Error posting session ${sessionKey}:`, error.message);
        }
      }

      return results;
    } catch (error) {
      console.error('Error posting multiple warden photos to Twitter:', error.message);
      return null;
    }
  }

  /**
   * Group photos by school and meal session
   */
  groupPhotosBySession(photos) {
    const grouped = {};
    
    photos.forEach(photo => {
      const sessionKey = `${photo.schoolId}_${photo.mealType}_${new Date(photo.timestamp).toDateString()}`;
      if (!grouped[sessionKey]) {
        grouped[sessionKey] = [];
      }
      grouped[sessionKey].push(photo);
    });

    return grouped;
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
   * Add delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if Twitter service is available
   */
  isAvailable() {
    return this.isEnabled;
  }

  /**
   * Get API usage info (for monitoring free tier limits)
   */
  async getApiUsage() {
    try {
      if (!this.isEnabled) {
        return null;
      }

      // Note: Twitter API v2 doesn't provide usage info in free tier
      // This is a placeholder for future monitoring
      return {
        tweetsThisMonth: 'Not available in free tier',
        limit: 1500,
        message: 'Monitor usage manually'
      };
    } catch (error) {
      console.error('Error getting API usage:', error.message);
      return null;
    }
  }
}

// Create singleton instance
const twitterService = new TwitterService();

export default twitterService;
