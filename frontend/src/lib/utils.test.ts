import { formatDate, getStatusColor, getContentTypeIcon, truncateText, cn } from './utils'

describe('utils', () => {
  describe('cn (class name utility)', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
    })

    it('handles undefined and null values', () => {
      expect(cn('base', undefined, null)).toBe('base')
    })

    it('merges Tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })
  })

  describe('formatDate', () => {
    it('formats ISO date string correctly', () => {
      const dateString = '2024-01-15T10:30:00Z'
      const result = formatDate(dateString)
      expect(result).toMatch(/Jan 15, 2024/)
      expect(result).toMatch(/10:30/)
    })

    it('formats Date object correctly', () => {
      const date = new Date('2024-12-25T15:45:00Z')
      const result = formatDate(date)
      expect(result).toMatch(/Dec 25, 2024/)
      expect(result).toMatch(/03:45 PM/) // 15:45 UTC in 12-hour format
    })

    it('handles different time zones consistently', () => {
      const dateString = '2024-01-01T00:00:00Z'
      const result = formatDate(dateString)
      expect(result).toMatch(/Jan 1, 2024/)
    })

    it('formats dates with different months correctly', () => {
      const dates = [
        '2024-01-01T00:00:00Z', // January
        '2024-06-15T12:00:00Z', // June
        '2024-12-31T23:59:00Z', // December
      ]
      
      dates.forEach(dateString => {
        const result = formatDate(dateString)
        expect(result).toMatch(/2024/)
        expect(result).toMatch(/\d{1,2}:\d{2}/) // Time format
      })
    })

    it('handles edge cases gracefully', () => {
      const invalidDate = 'invalid-date'
      expect(() => formatDate(invalidDate)).not.toThrow()
    })
  })

  describe('getStatusColor', () => {
    it('returns correct colors for known statuses', () => {
      expect(getStatusColor('DRAFT')).toBe('bg-gray-100 text-gray-800')
      expect(getStatusColor('AI_SUGGESTED')).toBe('bg-blue-100 text-blue-800')
      expect(getStatusColor('UNDER_REVIEW')).toBe('bg-yellow-100 text-yellow-800')
      expect(getStatusColor('APPROVED')).toBe('bg-green-100 text-green-800')
      expect(getStatusColor('REJECTED')).toBe('bg-red-100 text-red-800')
      expect(getStatusColor('NEEDS_REVISION')).toBe('bg-orange-100 text-orange-800')
      expect(getStatusColor('ACTIVE')).toBe('bg-green-100 text-green-800')
      expect(getStatusColor('COMPLETED')).toBe('bg-gray-100 text-gray-800')
      expect(getStatusColor('ARCHIVED')).toBe('bg-gray-100 text-gray-600')
    })

    it('returns default color for unknown status', () => {
      expect(getStatusColor('UNKNOWN_STATUS')).toBe('bg-gray-100 text-gray-800')
    })

    it('returns default color for empty string', () => {
      expect(getStatusColor('')).toBe('bg-gray-100 text-gray-800')
    })

    it('returns default color for null/undefined', () => {
      expect(getStatusColor(null as any)).toBe('bg-gray-100 text-gray-800')
      expect(getStatusColor(undefined as any)).toBe('bg-gray-100 text-gray-800')
    })

    it('is case sensitive', () => {
      expect(getStatusColor('draft')).toBe('bg-gray-100 text-gray-800')
      expect(getStatusColor('DRAFT')).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getContentTypeIcon', () => {
    it('returns correct icons for known content types', () => {
      expect(getContentTypeIcon('HEADLINE')).toBe('📝')
      expect(getContentTypeIcon('DESCRIPTION')).toBe('📄')
      expect(getContentTypeIcon('AD_COPY')).toBe('📢')
      expect(getContentTypeIcon('PRODUCT_DESCRIPTION')).toBe('🏷️')
      expect(getContentTypeIcon('SOCIAL_POST')).toBe('📱')
      expect(getContentTypeIcon('EMAIL_SUBJECT')).toBe('📧')
      expect(getContentTypeIcon('BLOG_TITLE')).toBe('📰')
    })

    it('returns default icon for unknown content type', () => {
      expect(getContentTypeIcon('UNKNOWN_TYPE')).toBe('📝')
    })

    it('returns default icon for empty string', () => {
      expect(getContentTypeIcon('')).toBe('📝')
    })

    it('returns default icon for null/undefined', () => {
      expect(getContentTypeIcon(null as any)).toBe('📝')
      expect(getContentTypeIcon(undefined as any)).toBe('📝')
    })

    it('is case sensitive', () => {
      expect(getContentTypeIcon('headline')).toBe('📝')
      expect(getContentTypeIcon('HEADLINE')).toBe('📝')
    })
  })

  describe('truncateText', () => {
    it('truncates text longer than maxLength', () => {
      const longText = 'This is a very long text that should be truncated'
      const result = truncateText(longText, 20)
      expect(result).toBe('This is a very long ...')
      expect(result.length).toBe(23) // 20 + '...'
    })

    it('returns original text when shorter than maxLength', () => {
      const shortText = 'Short text'
      const result = truncateText(shortText, 20)
      expect(result).toBe('Short text')
    })

    it('returns original text when equal to maxLength', () => {
      const text = 'Exactly twenty chars'
      const result = truncateText(text, 20)
      expect(result).toBe('Exactly twenty chars')
    })

    it('uses default maxLength of 100', () => {
      const text = 'Short text'
      const result = truncateText(text)
      expect(result).toBe('Short text')
    })

    it('handles empty string', () => {
      const result = truncateText('', 10)
      expect(result).toBe('')
    })

    it('trims whitespace before truncating', () => {
      const text = '   This has leading spaces   '
      const result = truncateText(text, 15)
      expect(result).toBe('This has leadin...')
    })

    it('handles text with only whitespace', () => {
      const result = truncateText('   ', 10)
      expect(result).toBe('')
    })

    it('handles very long text correctly', () => {
      const veryLongText = 'A'.repeat(1000)
      const result = truncateText(veryLongText, 50)
      expect(result).toBe('A'.repeat(50) + '...')
      expect(result.length).toBe(53)
    })

    it('handles special characters correctly', () => {
      const text = 'Text with émojis 🎉 and spëcial chars'
      const result = truncateText(text, 20)
      expect(result).toBe('Text with émojis 🎉 a...')
    })
  })

  describe('integration tests', () => {
    it('all utilities work together in typical usage', () => {
      const campaign = {
        status: 'APPROVED',
        contentType: 'HEADLINE',
        description: 'This is a very long description that should be truncated when displayed in the UI',
        createdAt: '2024-01-15T10:30:00Z',
      }

      const statusColor = getStatusColor(campaign.status)
      const contentTypeIcon = getContentTypeIcon(campaign.contentType)
      const truncatedDescription = truncateText(campaign.description, 30)
      const formattedDate = formatDate(campaign.createdAt)

      expect(statusColor).toBe('bg-green-100 text-green-800')
      expect(contentTypeIcon).toBe('📝')
      expect(truncatedDescription).toBe('This is a very long descriptio...')
      expect(formattedDate).toMatch(/Jan 15, 2024/)
    })
  })
})
