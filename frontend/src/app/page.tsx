'use client';

import { useQuery, useSubscription } from '@apollo/client';
import Link from 'next/link';
import { Plus, Briefcase, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { GET_CAMPAIGNS } from '@/graphql/queries';
import { CAMPAIGN_CREATED, CAMPAIGN_UPDATED, CONTENT_PIECE_CREATED, CONTENT_PIECE_UPDATED } from '@/graphql/subscriptions';
import { formatDate, getStatusColor } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';

export default function HomePage() {
  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGNS);

  // Subscribe to real-time updates
  useSubscription(CAMPAIGN_CREATED, {
    onData: () => {
      refetch();
    },
  });

  useSubscription(CAMPAIGN_UPDATED, {
    onData: () => {
      refetch();
    },
  });

  useSubscription(CONTENT_PIECE_CREATED, {
    onData: () => {
      refetch();
    },
  });

  useSubscription(CONTENT_PIECE_UPDATED, {
    onData: () => {
      refetch();
    },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const campaigns = data?.campaigns || [];

  // Calculate dashboard stats
  const stats = campaigns.reduce(
    (acc: any, campaign: any) => {
      acc.total += 1;
      acc.contentPieces += campaign.contentPieces.length;
      
      campaign.contentPieces.forEach((piece: any) => {
        if (piece.reviewState === 'AI_SUGGESTED') acc.aiSuggested += 1;
        if (piece.reviewState === 'UNDER_REVIEW') acc.underReview += 1;
        if (piece.reviewState === 'APPROVED') acc.approved += 1;
      });
      
      return acc;
    },
    { total: 0, contentPieces: 0, aiSuggested: 0, underReview: 0, approved: 0 }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🚀 AI Content Workflow
              </h1>
              <span className="ml-3 text-sm text-gray-500">ACME Global Media</span>
            </div>
            <Link
              href="/campaigns/new"
              className="btn btn-primary btn-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Content Pieces</p>
                <p className="text-2xl font-bold text-gray-900">{stats.contentPieces}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                🤖
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Suggested</p>
                <p className="text-2xl font-bold text-gray-900">{stats.aiSuggested}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Campaigns</h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="card p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first campaign with AI-powered content generation.
            </p>
            <Link href="/campaigns/new" className="btn btn-primary btn-md">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign: any) => (
              <div key={campaign.id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {campaign.name}
                  </h3>
                  <span className={`badge badge-outline ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                
                {campaign.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {campaign.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{campaign.contentPieces.length} content pieces</span>
                  <span>{formatDate(campaign.updatedAt)}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {campaign.targetLanguages.slice(0, 3).map((lang: string) => (
                    <span key={lang} className="badge badge-secondary text-xs">
                      {lang.toUpperCase()}
                    </span>
                  ))}
                  {campaign.targetLanguages.length > 3 && (
                    <span className="badge badge-secondary text-xs">
                      +{campaign.targetLanguages.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/campaigns/${campaign.id}/edit`}
                    className="btn btn-outline btn-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
