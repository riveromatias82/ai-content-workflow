'use client';

import { useState } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { CREATE_CONTENT_PIECE } from '@/graphql/mutations';
import { GET_CAMPAIGN } from '@/graphql/queries';
import { CONTENT_PIECE_CREATED, CONTENT_PIECE_UPDATED } from '@/graphql/subscriptions';

const CONTENT_TYPES = [
  { value: 'HEADLINE', label: 'Headline', icon: '📝' },
  { value: 'DESCRIPTION', label: 'Description', icon: '📄' },
  { value: 'AD_COPY', label: 'Ad Copy', icon: '📢' },
  { value: 'PRODUCT_DESCRIPTION', label: 'Product Description', icon: '🛍️' },
  { value: 'SOCIAL_POST', label: 'Social Media Post', icon: '📱' },
  { value: 'EMAIL_SUBJECT', label: 'Email Subject', icon: '✉️' },
  { value: 'BLOG_TITLE', label: 'Blog Title', icon: '📰' },
];

const TONE_OPTIONS = [
  'Professional',
  'Casual',
  'Friendly',
  'Formal',
  'Conversational',
  'Authoritative',
  'Persuasive',
  'Informative',
  'Entertaining',
  'Inspiring',
];

const COMMON_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
];

export default function NewContentPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [formData, setFormData] = useState({
    title: '',
    type: 'HEADLINE',
    briefing: '',
    targetAudience: '',
    tone: 'Professional',
    keywords: [] as string[],
    sourceLanguage: 'en',
  });

  const [newKeyword, setNewKeyword] = useState('');

  const { data: campaignData, loading: campaignLoading, refetch } = useQuery(GET_CAMPAIGN, {
    variables: { id: campaignId },
  });

  // Subscribe to real-time content piece updates for this campaign
  useSubscription(CONTENT_PIECE_CREATED, {
    onData: ({ data: subscriptionData }) => {
      // Only refetch if the new content piece is for this campaign
      if (subscriptionData?.data?.contentPieceCreated?.campaign?.id === campaignId) {
        refetch();
      }
    },
  });

  useSubscription(CONTENT_PIECE_UPDATED, {
    onData: ({ data: subscriptionData }) => {
      // Only refetch if the updated content piece is for this campaign
      if (subscriptionData?.data?.contentPieceUpdated?.id) {
        // We need to check if this content piece belongs to our campaign
        // Since the subscription doesn't include campaign info, we'll refetch
        // This could be optimized by including campaign info in the subscription
        refetch();
      }
    },
  });

  const [createContentPiece, { loading }] = useMutation(CREATE_CONTENT_PIECE, {
    refetchQueries: [{ query: GET_CAMPAIGN, variables: { id: campaignId } }],
    onCompleted: (data) => {
      router.push(`/campaigns/${campaignId}`);
    },
    onError: (error) => {
      console.error('Error creating content piece:', error);
      alert('Failed to create content piece. Please try again.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    await createContentPiece({
      variables: {
        createContentPieceInput: {
          campaignId,
          title: formData.title.trim(),
          type: formData.type,
          briefing: formData.briefing.trim() || undefined,
          targetAudience: formData.targetAudience.trim() || undefined,
          tone: formData.tone,
          keywords: formData.keywords.length > 0 ? formData.keywords : undefined,
          sourceLanguage: formData.sourceLanguage,
        },
      },
    });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()],
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword),
    }));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  if (campaignLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  const campaign = campaignData?.campaign;

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
          <p className="text-gray-600 mb-6">The campaign you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Link href="/" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href={`/campaigns/${campaignId}`} className="btn btn-ghost btn-sm mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaign
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create New Content</h1>
                <p className="text-sm text-gray-600">for {campaign.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Content Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="input input-bordered w-full"
                  placeholder="Enter content title"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CONTENT_TYPES.map(type => (
                    <label
                      key={type.value}
                      className={`cursor-pointer p-3 border rounded-lg transition-colors ${
                        formData.type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-sm font-medium text-gray-900">{type.label}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="briefing" className="block text-sm font-medium text-gray-700 mb-2">
                  Content Brief
                </label>
                <textarea
                  id="briefing"
                  value={formData.briefing}
                  onChange={(e) => setFormData(prev => ({ ...prev, briefing: e.target.value }))}
                  className="textarea textarea-bordered w-full h-32"
                  placeholder="Describe what this content should be about, key messages, goals, etc."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will help AI generate more targeted content
                </p>
              </div>
            </div>
          </div>

          {/* Content Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Content Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="input input-bordered w-full"
                  placeholder="e.g., Small business owners, Tech professionals"
                />
              </div>

              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  id="tone"
                  value={formData.tone}
                  onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                  className="select select-bordered w-full"
                >
                  {TONE_OPTIONS.map(tone => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="sourceLanguage" className="block text-sm font-medium text-gray-700 mb-2">
                  Source Language
                </label>
                <select
                  id="sourceLanguage"
                  value={formData.sourceLanguage}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceLanguage: e.target.value }))}
                  className="select select-bordered w-full md:w-64"
                >
                  {COMMON_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  The language in which content will be initially created
                </p>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Keywords & SEO</h2>
            
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map(keyword => (
                    <div key={keyword} className="badge badge-primary gap-2">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="btn btn-ghost btn-xs p-0 h-auto min-h-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={handleKeywordKeyPress}
                  className="input input-bordered flex-1"
                  placeholder="Add a keyword"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="btn btn-outline"
                  disabled={!newKeyword.trim()}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Press Enter or click + to add keywords. These will help optimize content for search and relevance.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
            <Link 
              href={`/campaigns/${campaignId}`} 
              className="btn btn-outline btn-md order-2 sm:order-1"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="btn btn-primary btn-md order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Content Piece
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
