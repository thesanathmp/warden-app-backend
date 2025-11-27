# Twitter Integration Setup Guide

## Overview
This guide helps you set up Twitter (X) integration to automatically post warden photos to the Department of Food Karnataka's Twitter account.

## Prerequisites
1. Twitter Developer Account (Free tier is sufficient for testing)
2. Twitter App created in the Developer Portal
3. API Keys and Access Tokens

## Step 1: Twitter Developer Account Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with the Twitter account you want to post from (Department of Food Karnataka account)
3. Apply for a developer account if you don't have one
4. Create a new App in the Developer Portal

## Step 2: Get API Credentials

From your Twitter App dashboard, you'll need:
- **API Key** (Consumer Key)
- **API Secret** (Consumer Secret)
- **Access Token**
- **Access Token Secret**

## Step 3: Environment Variables

Add these variables to your backend `.env` file:

```env
# Twitter API Configuration
TWITTER_API_KEY=your-twitter-api-key-here
TWITTER_API_SECRET=your-twitter-api-secret-here
TWITTER_ACCESS_TOKEN=your-twitter-access-token-here
TWITTER_ACCESS_TOKEN_SECRET=your-twitter-access-token-secret-here

# Optional: Enable/Disable Twitter posting
TWITTER_ENABLED=true

# Optional: Tweet batching controls
# Post once N photos (default 4) from same school + meal arrive within window
TWITTER_BATCH_SIZE=4
# Minutes to keep photos in the same batch window (default 10)
TWITTER_BATCH_WINDOW_MINUTES=10
# Fallback: if photos remain pending longer than this, tweet individually
TWITTER_SINGLE_FALLBACK_MINUTES=5
```

## Step 4: Install Dependencies

Run this command in the backend directory:
```bash
npm install
```

## Free Tier Limitations

- **Monthly Tweet Limit**: 1,500 tweets per month
- **Media Upload**: Supported (images up to 5MB)
- **Rate Limits**: 300 requests per 15-minute window

For testing with 3-4 wardens uploading 4 photos each per day:
- Daily tweets: ~12-16 tweets
- Monthly tweets: ~360-480 tweets
- Well within the 1,500 limit!

## Tweet Format

The system will automatically create tweets like:

# Multi-photo tweets automatically bundle up to 4 photos when wardens upload
# multiple shots for the same meal within the batch window.
```
🍽️ Lunch served at Government Primary School XYZ

📸 Photo by: Warden Name
📅 Nov 26, 2024, 2:30 PM

#MidDayMeal #KarnatakaEducation #FoodSafety #SchoolNutrition #DepartmentOfFood
```

## Testing

1. Set up environment variables
2. Restart the backend server
3. Upload photos through the warden app
4. Check the Twitter account for automatic posts

## Troubleshooting

- If Twitter posting fails, the main photo upload will still work
- Check server logs for Twitter API errors
- Verify API credentials are correct
- Ensure the Twitter app has read/write permissions

## Monitoring Usage

- Monitor your monthly tweet count manually
- Consider upgrading to Basic tier ($100/month) if you exceed limits
- The system includes error handling to prevent upload failures
