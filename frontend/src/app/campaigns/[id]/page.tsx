'use client';

import * as React from 'react';
const { useState } = React;
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Bot, Globe, Eye, X } from 'lucide-react';
import { GET_CAMPAIGN, GET_CAMPAIGN_STATS } from '@/graphql/queries';
import { AI_CONTENT_GENERATED, CONTENT_TRANSLATED } from '@/graphql/subscriptions';
import { GENERATE_AI_CONTENT, TRANSLATE_CONTENT } from '@/graphql/mutations';
import { formatDate, getStatusColor, getContentTypeIcon } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  
  // State for AI and translation functionality
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState<string | null>(null);
  const [showTranslateModal, setShowTranslateModal] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGN, {
    variables: { id: campaignId },
  });

  const { data: statsData } = useQuery(GET_CAMPAIGN_STATS, {
    variables: { id: campaignId },
  });

  // Mutations
  const [generateAiContent] = useMutation(GENERATE_AI_CONTENT, {
    onCompleted: (data) => {
      setIsGenerating(null);
      refetch();
    },
    onError: (error) => {
      setIsGenerating(null);
      console.error('Error generating AI content:', error);
      alert('Failed to generate AI content. Please try again.');
    }
  });

  const [translateContent] = useMutation(TRANSLATE_CONTENT, {
    onCompleted: () => {
      setIsTranslating(null);
      setShowTranslateModal(null);
      setTargetLanguage('');
      refetch();
    },
    onError: (error) => {
      setIsTranslating(null);
      console.error('Error translating content:', error);
      alert('Failed to translate content. Please try again.');
    }
  });

  // Subscribe to AI content generation events
  useSubscription(AI_CONTENT_GENERATED, {
    onData: () => {
      refetch();
    },
  });

  // Subscribe to content translation events
  useSubscription(CONTENT_TRANSLATED, {
    onData: () => {
      refetch();
    },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const campaign = data?.campaign;
  const stats = statsData?.campaignStats;

  if (!campaign) {
    return <ErrorMessage error={{ message: 'Campaign not found' }} />;
  }

  // Handler functions
  const handleGenerateAI = async (contentPieceId: string) => {
    setIsGenerating(contentPieceId);
    try {
      await generateAiContent({
        variables: {
          generateAiContentInput: {
            contentPieceId: contentPieceId,
            provider: 'OPENAI'
          }
        }
      });
    } catch (error) {
      console.error('Error in handleGenerateAI:', error);
    }
  };

  const handleTranslateClick = (contentPieceId: string) => {
    setShowTranslateModal(contentPieceId);
  };

  const handleTranslate = async () => {
    if (!showTranslateModal || !targetLanguage) return;
    
    const contentPiece = campaign.contentPieces.find((p: any) => p.id === showTranslateModal);
    if (!contentPiece) return;
    
    const activeVersion = contentPiece.versions.find((v: any) => v.isActive);
    if (!activeVersion) {
      alert('No active version found to translate.');
      return;
    }
    
    setIsTranslating(showTranslateModal);
    try {
      await translateContent({
        variables: {
          translateContentInput: {
            contentVersionId: activeVersion.id,
            targetLanguage: targetLanguage,
            provider: 'OPENAI'
          }
        }
      });
    } catch (error) {
      console.error('Error in handleTranslate:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="btn btn-ghost btn-sm mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{campaign.name}</h1>
                {campaign.description && (
                  <p className="text-sm text-gray-600">{campaign.description}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/campaigns/${campaign.id}/edit`}
                className="btn btn-outline btn-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Campaign
              </Link>
              <Link
                href={`/campaigns/${campaign.id}/content/new`}
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Campaign Info */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Status</h3>
            <span className={`badge ${getStatusColor(campaign.status)}`}>
              {campaign.status}
            </span>
          </div>
          
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Target Languages</h3>
            <div className="flex flex-wrap gap-1">
              {campaign.targetLanguages.slice(0, 3).map((lang: string) => (
                <span key={lang} className="badge badge-secondary text-xs">
                  {lang.toUpperCase()}
                </span>
              ))}
              {campaign.targetLanguages.length > 3 && (
                <span className="badge badge-secondary text-xs">
                  +{campaign.targetLanguages.length - 3}
                </span>
              )}
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Target Markets</h3>
            <div className="text-sm text-gray-900">
              {campaign.targetMarkets.length > 0 
                ? campaign.targetMarkets.slice(0, 2).join(', ')
                : 'Global'
              }
              {campaign.targetMarkets.length > 2 && (
                <span className="text-gray-500"> +{campaign.targetMarkets.length - 2} more</span>
              )}
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Created</h3>
            <p className="text-sm text-gray-900">{formatDate(campaign.createdAt)}</p>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalContentPieces}</div>
              <div className="text-xs text-gray-600">Total Content</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.draftCount}</div>
              <div className="text-xs text-gray-600">Drafts</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.aiSuggestedCount}</div>
              <div className="text-xs text-gray-600">AI Suggested</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.underReviewCount}</div>
              <div className="text-xs text-gray-600">Under Review</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approvedCount}</div>
              <div className="text-xs text-gray-600">Approved</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejectedCount}</div>
              <div className="text-xs text-gray-600">Rejected</div>
            </div>
          </div>
        )}

        {/* Content Pieces */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Pieces</h2>
        </div>

        {campaign.contentPieces.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              📝
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content pieces yet</h3>
            <p className="text-gray-600 mb-6">
              Start creating content for this campaign using AI-powered generation.
            </p>
            <Link
              href={`/campaigns/${campaign.id}/content/new`}
              className="btn btn-primary btn-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Content Piece
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {campaign.contentPieces.map((piece: any) => (
              <div key={piece.id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getContentTypeIcon(piece.type)}</span>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {piece.title}
                    </h3>
                  </div>
                  <span className={`badge badge-outline ${getStatusColor(piece.reviewState)}`}>
                    {piece.reviewState.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Type: {piece.type.replace('_', ' ')}</p>
                  {piece.briefing && (
                    <p className="text-sm text-gray-600 line-clamp-2">{piece.briefing}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">
                    {piece.versions.length} version{piece.versions.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {piece.versions
                      .reduce((langs: string[], version: any) => {
                        if (!langs.includes(version.language)) {
                          langs.push(version.language);
                        }
                        return langs;
                      }, [])
                      .slice(0, 3)
                      .map((lang: string) => (
                        <span key={lang} className="badge badge-secondary text-xs">
                          {lang.toUpperCase()}
                        </span>
                      ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    href={`/content/${piece.id}`}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Link>
                  <button 
                    className="btn btn-outline btn-sm" 
                    onClick={() => handleGenerateAI(piece.id)}
                    disabled={isGenerating === piece.id}
                  >
                    <Bot className="w-3 h-3 mr-1" />
                    {isGenerating === piece.id ? 'Generating...' : 'AI'}
                  </button>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleTranslateClick(piece.id)}
                    disabled={isTranslating === piece.id}
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    {isTranslating === piece.id ? 'Translating...' : 'Translate'}
                  </button>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Updated {formatDate(piece.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Translation Modal */}
      {showTranslateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Translate Content</h3>
              <button
                onClick={() => {
                  setShowTranslateModal(null);
                  setTargetLanguage('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a language</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
                <option value="nl">Dutch</option>
                <option value="sv">Swedish</option>
                <option value="da">Danish</option>
                <option value="no">Norwegian</option>
                <option value="fi">Finnish</option>
                <option value="pl">Polish</option>
                <option value="cs">Czech</option>
                <option value="hu">Hungarian</option>
                <option value="ro">Romanian</option>
                <option value="bg">Bulgarian</option>
                <option value="hr">Croatian</option>
                <option value="sk">Slovak</option>
                <option value="sl">Slovenian</option>
                <option value="et">Estonian</option>
                <option value="lv">Latvian</option>
                <option value="lt">Lithuanian</option>
                <option value="mt">Maltese</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowTranslateModal(null);
                  setTargetLanguage('');
                }}
                className="flex-1 btn btn-outline btn-md"
              >
                Cancel
              </button>
              <button
                onClick={handleTranslate}
                disabled={!targetLanguage || isTranslating === showTranslateModal}
                className="flex-1 btn btn-primary btn-md"
              >
                {isTranslating === showTranslateModal ? 'Translating...' : 'Translate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
