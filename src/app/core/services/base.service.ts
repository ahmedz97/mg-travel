
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  constructor(protected HttpClient: HttpClient) {}
  baseUrl = 'https://tourism-api.perfectsolutions4u.com/api';
  apiBaseUrl = 'https://tourism-api.perfectsolutions4u.com';

  // Helper method to get full image URL
  getImageUrl(imagePath: string | null | undefined, addCacheBust: boolean = true): string {
    if (!imagePath) {
      return '';
    }
    
    let fullUrl = '';
    
    // If it's already a full URL (starts with http:// or https://), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      fullUrl = imagePath;
    } else if (imagePath.startsWith('/')) {
      // If it starts with /, it's a relative path from the API base
      fullUrl = `${this.apiBaseUrl}${imagePath}`;
    } else {
      // Otherwise, assume it's relative to API base
      fullUrl = `${this.apiBaseUrl}/${imagePath}`;
    }
    
    // Add cache busting parameter to ensure fresh image in production
    // Use a timestamp that changes every hour to balance freshness and caching
    if (addCacheBust && fullUrl) {
      const separator = fullUrl.includes('?') ? '&' : '?';
      // Use hourly timestamp to allow some caching but ensure updates
      const cacheBust = Math.floor(Date.now() / (1000 * 60 * 60)); // Changes every hour
      fullUrl = `${fullUrl}${separator}v=${cacheBust}`;
    }
    
    return fullUrl;
  }
}
