'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X } from 'lucide-react';
import { UPDATE_CAMPAIGN } from '@/graphql/mutations';
import { GET_CAMPAIGN } from '@/graphql/queries';
import { CAMPAIGN_UPDATED } from '@/graphql/subscriptions';

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

const COMMON_MARKETS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East',
  'Africa',
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Canada',
  'Australia',
  'Brazil',
  'India',
  'China',
  'Japan',
  'South Korea',
  'Mexico',
];

const CAMPAIGN_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
];

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'DRAFT',
    targetLanguages: ['en'],
    targetMarkets: [] as string[],
  });

  const [updateCampaign, { loading }] = useMutation(UPDATE_CAMPAIGN, {
    onCompleted: (data) => {
      router.push(`/campaigns/${campaignId}`);
    },
    onError: (error) => {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign. Please try again.');
    },
  });

  const { data, loading: queryLoading, error, refetch } = useQuery(GET_CAMPAIGN, {
    variables: { id: campaignId },
    onCompleted: (data) => {
      if (data.campaign) {
        setFormData({
          name: data.campaign.name || '',
          description: data.campaign.description || '',
          status: data.campaign.status || 'DRAFT',
          targetLanguages: data.campaign.targetLanguages || ['en'],
          targetMarkets: data.campaign.targetMarkets || [],
        });
      }
    },
  });

  // Subscribe to real-time campaign updates
  useSubscription(CAMPAIGN_UPDATED, {
    onData: ({ data: subscriptionData }) => {
      // Only refetch if the update is for this campaign
      if (subscriptionData?.data?.campaignUpdated?.id === campaignId) {
        refetch();
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Campaign name is required');
      return;
    }

    await updateCampaign({
      variables: {
        id: campaignId,
        updateCampaignInput: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          status: formData.status,
          targetLanguages: formData.targetLanguages,
          targetMarkets: formData.targetMarkets,
        },
      },
    });
  };

  const addLanguage = (langCode: string) => {
    if (!formData.targetLanguages.includes(langCode)) {
      setFormData(prev => ({
        ...prev,
        targetLanguages: [...prev.targetLanguages, langCode],
      }));
    }
  };

  const removeLanguage = (langCode: string) => {
    if (formData.targetLanguages.length > 1) {
      setFormData(prev => ({
        ...prev,
        targetLanguages: prev.targetLanguages.filter(lang => lang !== langCode),
      }));
    }
  };

  const addMarket = (market: string) => {
    if (!formData.targetMarkets.includes(market)) {
      setFormData(prev => ({
        ...prev,
        targetMarkets: [...prev.targetMarkets, market],
      }));
    }
  };

  const removeMarket = (market: string) => {
    setFormData(prev => ({
      ...prev,
      targetMarkets: prev.targetMarkets.filter(m => m !== market),
    }));
  };

  if (queryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.campaign) {
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
                <h1 className="text-xl font-semibold text-gray-900">Edit Campaign</h1>
                <p className="text-sm text-gray-600">Update campaign details and settings</p>
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input input-bordered w-full"
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Describe the campaign objectives and goals"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="select select-bordered w-full"
                >
                  {CAMPAIGN_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Target Languages */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Target Languages</h2>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {formData.targetLanguages.map(lang => (
                  <div key={lang} className="badge badge-primary gap-2">
                    {COMMON_LANGUAGES.find(l => l.code === lang)?.name || lang.toUpperCase()}
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      className="btn btn-ghost btn-xs p-0 h-auto min-h-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {COMMON_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => addLanguage(lang.code)}
                  disabled={formData.targetLanguages.includes(lang.code)}
                  className={`btn btn-sm ${
                    formData.targetLanguages.includes(lang.code)
                      ? 'btn-disabled'
                      : 'btn-outline'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Target Markets */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Target Markets</h2>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {formData.targetMarkets.map(market => (
                  <div key={market} className="badge badge-secondary gap-2">
                    {market}
                    <button
                      type="button"
                      onClick={() => removeMarket(market)}
                      className="btn btn-ghost btn-xs p-0 h-auto min-h-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {COMMON_MARKETS.map(market => (
                <button
                  key={market}
                  type="button"
                  onClick={() => addMarket(market)}
                  disabled={formData.targetMarkets.includes(market)}
                  className={`btn btn-sm ${
                    formData.targetMarkets.includes(market)
                      ? 'btn-disabled'
                      : 'btn-outline'
                  }`}
                >
                  {market}
                </button>
              ))}
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
              disabled={loading || !formData.name.trim()}
              className="btn btn-primary btn-md order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
