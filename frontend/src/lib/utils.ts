import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  try {
    const dateObj = new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC', // Use UTC to ensure consistent formatting
    }).format(dateObj);
  } catch (error) {
    return 'Invalid Date';
  }
}

export function getStatusColor(status: string) {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    AI_SUGGESTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    NEEDS_REVISION: 'bg-orange-100 text-orange-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    ARCHIVED: 'bg-gray-100 text-gray-600',
  };
  
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

export function getContentTypeIcon(type: string) {
  const icons = {
    HEADLINE: '📝',
    DESCRIPTION: '📄',
    AD_COPY: '📢',
    PRODUCT_DESCRIPTION: '🏷️',
    SOCIAL_POST: '📱',
    EMAIL_SUBJECT: '📧',
    BLOG_TITLE: '📰',
  };
  
  return icons[type as keyof typeof icons] || '📝';
}

export function truncateText(text: string, maxLength: number = 100) {
  if (!text) return text;
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  
  // Use Array.from to properly handle Unicode characters (emojis, etc.)
  const chars = Array.from(trimmed);
  if (chars.length <= maxLength) return trimmed;
  
  return chars.slice(0, maxLength).join('') + '...';
}
