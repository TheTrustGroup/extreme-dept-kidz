/**
 * ADVANCED BOT DETECTION
 * Blocks automated attacks and malicious bots
 */

import { NextRequest } from 'next/server';

interface BotDetectionResult {
  isBot: boolean;
  score: number; // 0-100, higher = more likely bot
  reasons: string[];
}

/**
 * Detect bots using multiple signals
 */
export function detectBot(request: NextRequest): BotDetectionResult {
  const reasons: string[] = [];
  let score = 0;

  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer');
  const acceptLanguage = request.headers.get('accept-language');
  const acceptEncoding = request.headers.get('accept-encoding');

  // 1. Check User-Agent
  const suspiciousUAs = [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 
    'python', 'java', 'go-http', 'axios', 'okhttp'
  ];
  
  const uaLower = userAgent.toLowerCase();
  if (suspiciousUAs.some(ua => uaLower.includes(ua))) {
    score += 50;
    reasons.push('Suspicious user agent');
  }

  // 2. Check for missing headers (bots often don't send these)
  // Reduced scoring - some legitimate browsers may not send these
  if (!acceptLanguage) {
    score += 10; // Reduced from 20
    reasons.push('Missing accept-language');
  }

  if (!acceptEncoding) {
    score += 10; // Reduced from 20
    reasons.push('Missing accept-encoding');
  }

  // 3. Check for common bot patterns
  if (!userAgent || userAgent.length < 10) {
    score += 20; // Reduced from 30
    reasons.push('Empty or very short user agent');
  }

  // 4. Check for headless browser signatures (only block obvious ones)
  const headlessSignatures = ['headless', 'phantom', 'selenium', 'puppeteer', 'playwright'];
  if (headlessSignatures.some(sig => uaLower.includes(sig))) {
    score += 70;
    reasons.push('Headless browser detected');
  }

  // 5. Check for missing or suspicious referer
  // Removed - too many false positives, especially with mobile browsers
  // if (!referer && request.method === 'POST') {
  //   score += 15;
  //   reasons.push('Missing referer on POST request');
  // }

  // 6. Allow known good bots (Google, etc.)
  const goodBots = ['googlebot', 'bingbot', 'slackbot', 'twitterbot'];
  if (goodBots.some(bot => uaLower.includes(bot))) {
    score = 0;
    reasons.push('Known good bot');
  }

  return {
    isBot: score >= 50,
    score,
    reasons,
  };
}

/**
 * CAPTCHA challenge for suspicious requests
 */
export interface CaptchaChallenge {
  required: boolean;
  token?: string;
}

export function requiresCaptcha(botResult: BotDetectionResult): boolean {
  return botResult.score >= 30;
}

/**
 * Verify CAPTCHA token (integrate with service like hCaptcha or reCAPTCHA)
 */
export async function verifyCaptcha(token: string): Promise<boolean> {
  // TODO: Integrate with actual CAPTCHA service
  // Example with hCaptcha:
  
  if (!process.env.HCAPTCHA_SECRET_KEY) {
    console.warn('⚠️ CAPTCHA not configured');
    return true; // Allow in development
  }

  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET_KEY}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('CAPTCHA verification failed:', error);
    return false;
  }
}
