'use client';

import { useState } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { CREATE_CAMPAIGN } from '@/graphql/mutations';
import { GET_CAMPAIGNS } from '@/graphql/queries';
import { CAMPAIGN_CREATED, CAMPAIGN_UPDATED } from '@/graphql/subscriptions';

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
  'Japan',
  'Australia',
  'Brazil',
  'India',
  'China',
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetLanguages: ['en'],
    targetMarkets: [] as string[],
  });

  const [createCampaign, { loading }] = useMutation(CREATE_CAMPAIGN, {
    refetchQueries: [{ query: GET_CAMPAIGNS }],
    onCompleted: (data) => {
      router.push(`/campaigns/${data.createCampaign.id}`);
    },
  });

  // Subscribe to real-time campaign updates
  useSubscription(CAMPAIGN_CREATED, {
    onData: () => {
      // This will help keep the dashboard updated when campaigns are created
      // The refetchQueries in the mutation will handle the immediate update
    },
  });

  useSubscription(CAMPAIGN_UPDATED, {
    onData: () => {
      // This will help keep the dashboard updated when campaigns are updated
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    await createCampaign({
      variables: {
        createCampaignInput: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="btn btn-ghost btn-sm mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Create New Campaign</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input w-full"
                  placeholder="Enter campaign name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="textarea w-full"
                  rows={3}
                  placeholder="Describe the campaign goals and objectives"
                />
              </div>
            </div>
          </div>

          {/* Target Languages */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Languages</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Select languages for content localization:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.targetLanguages.map(langCode => {
                  const lang = COMMON_LANGUAGES.find(l => l.code === langCode);
                  return (
                    <span key={langCode} className="badge badge-primary flex items-center">
                      {lang?.name || langCode.toUpperCase()}
                      {formData.targetLanguages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLanguage(langCode)}
                          className="ml-1 hover:text-red-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {COMMON_LANGUAGES
                  .filter(lang => !formData.targetLanguages.includes(lang.code))
                  .map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => addLanguage(lang.code)}
                      className="btn btn-outline btn-sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {lang.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Target Markets */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Markets</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Select target markets for this campaign:</p>
              {formData.targetMarkets.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.targetMarkets.map(market => (
                    <span key={market} className="badge badge-secondary flex items-center">
                      {market}
                      <button
                        type="button"
                        onClick={() => removeMarket(market)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {COMMON_MARKETS
                  .filter(market => !formData.targetMarkets.includes(market))
                  .map(market => (
                    <button
                      key={market}
                      type="button"
                      onClick={() => addMarket(market)}
                      className="btn btn-outline btn-sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {market}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link href="/" className="btn btn-outline btn-md">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="btn btn-primary btn-md"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
