'use client';

import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Calendar, Globe, Tag, MessageSquare, Edit, CheckCircle, Clock, AlertCircle, Wand2, Languages, FileText, Plus, X } from 'lucide-react';
import { GET_CONTENT_PIECE } from '@/graphql/queries';
import { GENERATE_AI_CONTENT, TRANSLATE_CONTENT, CREATE_MANUAL_VERSION, UPDATE_CONTENT_PIECE } from '@/graphql/mutations';
import { CONTENT_PIECE_UPDATED, VERSION_UPDATED, ACTIVE_VERSION_CHANGED, AI_CONTENT_GENERATED, CONTENT_TRANSLATED } from '@/graphql/subscriptions';
import { formatDate, getStatusColor } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';

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

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [editFormData, setEditFormData] = useState({
    title: '',
    briefing: '',
    targetAudience: '',
    tone: '',
    keywords: [] as string[],
    reviewState: 'DRAFT'
  });

  const { data, loading, error, refetch } = useQuery(GET_CONTENT_PIECE, {
    variables: { id: contentId },
  });

  // Subscribe to real-time updates for this content piece
  useSubscription(CONTENT_PIECE_UPDATED, {
    onData: ({ data: subscriptionData }) => {
      // Only refetch if the update is for this content piece
      if (subscriptionData?.data?.contentPieceUpdated?.id === contentId) {
        refetch();
      }
    },
  });

  useSubscription(VERSION_UPDATED, {
    onData: ({ data: subscriptionData }) => {
      // Only refetch if the version update is for this content piece
      if (subscriptionData?.data?.versionUpdated?.contentPiece?.id === contentId) {
        refetch();
      }
    },
  });

  useSubscription(ACTIVE_VERSION_CHANGED, {
    onData: ({ data: subscriptionData }) => {
      // Only refetch if the active version change is for this content piece
      if (subscriptionData?.data?.activeVersionChanged?.contentPiece?.id === contentId) {
        refetch();
      }
    },
  });

  useSubscription(AI_CONTENT_GENERATED, {
    onData: ({ data: subscriptionData }) => {
      // Only refetch if the AI content is for this content piece
      if (subscriptionData?.data?.aiContentGenerated?.contentPiece?.id === contentId) {
        refetch();
      }
    },
  });

  useSubscription(CONTENT_TRANSLATED, {
    onData: ({ data: subscriptionData }) => {
      // Only refetch if the translation is for this content piece
      if (subscriptionData?.data?.contentTranslated?.contentPiece?.id === contentId) {
        refetch();
      }
    },
  });

  const [generateAiContent] = useMutation(GENERATE_AI_CONTENT, {
    onCompleted: () => {
      setIsGenerating(false);
      refetch();
    },
    onError: (error) => {
      setIsGenerating(false);
      console.error('Error generating AI content:', error);
      alert('Failed to generate AI content. Please try again.');
    }
  });

  const [translateContent] = useMutation(TRANSLATE_CONTENT, {
    onCompleted: () => {
      setIsTranslating(false);
      setShowTranslateModal(false);
      setTargetLanguage('');
      refetch();
    },
    onError: (error) => {
      setIsTranslating(false);
      console.error('Error translating content:', error);
      alert('Failed to translate content. Please try again.');
    }
  });

  const [createManualVersion] = useMutation(CREATE_MANUAL_VERSION, {
    onCompleted: () => {
      setIsCreatingManual(false);
      setShowManualModal(false);
      setManualContent('');
      refetch();
    },
    onError: (error) => {
      setIsCreatingManual(false);
      console.error('Error creating manual version:', error);
      alert('Failed to create manual version. Please try again.');
    }
  });

  const [updateContentPiece] = useMutation(UPDATE_CONTENT_PIECE, {
    onCompleted: () => {
      setIsUpdating(false);
      setShowEditModal(false);
      refetch();
    },
    onError: (error) => {
      setIsUpdating(false);
      console.error('Error updating content piece:', error);
      alert('Failed to update content piece. Please try again.');
    }
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const contentPiece = data?.contentPiece;

  const handleGenerateAI = async () => {
    if (!contentPiece) return;
    setIsGenerating(true);
    try {
      await generateAiContent({
        variables: {
          generateAiContentInput: {
            contentPieceId: contentPiece.id,
            provider: 'OPENAI'
          }
        }
      });
    } catch (error) {
      console.error('Error in handleGenerateAI:', error);
    }
  };

  const handleTranslate = async () => {
    if (!contentPiece || !targetLanguage) return;
    const activeVersion = contentPiece.versions.find((v: any) => v.isActive);
    if (!activeVersion) {
      alert('No active version found to translate.');
      return;
    }
    
    setIsTranslating(true);
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

  const handleCreateManual = async () => {
    if (!contentPiece || !manualContent.trim()) return;
    
    setIsCreatingManual(true);
    try {
      await createManualVersion({
        variables: {
          createManualVersionInput: {
            contentPieceId: contentPiece.id,
            content: manualContent.trim(),
            language: contentPiece.sourceLanguage
          }
        }
      });
    } catch (error) {
      console.error('Error in handleCreateManual:', error);
    }
  };

  const handleEditContent = () => {
    if (!contentPiece) return;
    
    // Populate form with current content piece data
    setEditFormData({
      title: contentPiece.title || '',
      briefing: contentPiece.briefing || '',
      targetAudience: contentPiece.targetAudience || '',
      tone: contentPiece.tone || 'Professional', // Default to 'Professional' if no tone is set
      keywords: contentPiece.keywords || [],
      reviewState: contentPiece.reviewState || 'DRAFT'
    });
    
    setShowEditModal(true);
  };

  const handleUpdateContent = async () => {
    if (!contentPiece || !editFormData.title.trim()) return;
    
    setIsUpdating(true);
    try {
      await updateContentPiece({
        variables: {
          id: contentPiece.id,
          updateContentPieceInput: {
            title: editFormData.title.trim(),
            briefing: editFormData.briefing.trim() || undefined,
            targetAudience: editFormData.targetAudience.trim() || undefined,
            tone: editFormData.tone.trim() || undefined,
            keywords: editFormData.keywords.filter(k => k.trim()),
            reviewState: editFormData.reviewState
          }
        }
      });
    } catch (error) {
      console.error('Error in handleUpdateContent:', error);
    }
  };

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword && !editFormData.keywords.includes(trimmedKeyword)) {
      setEditFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, trimmedKeyword]
      }));
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setEditFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keywordToRemove)
    }));
  };
  
  if (!contentPiece) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Content Not Found</h1>
            <p className="text-gray-600 mb-8">The content piece you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/" className="btn btn-primary btn-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeVersion = contentPiece.versions.find((v: any) => v.isActive);
  const getReviewStateIcon = (state: string) => {
    switch (state) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'UNDER_REVIEW':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case 'ORIGINAL':
        return 'bg-blue-100 text-blue-800';
      case 'AI_GENERATED':
        return 'bg-purple-100 text-purple-800';
      case 'AI_TRANSLATED':
        return 'bg-indigo-100 text-indigo-800';
      case 'HUMAN_EDITED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/campaigns/${contentPiece.campaign.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaign
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{contentPiece.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  {contentPiece.type.replace('_', ' ')}
                </div>
                <div className="flex items-center">
                  {getReviewStateIcon(contentPiece.reviewState)}
                  <span className="ml-1 capitalize">{contentPiece.reviewState.toLowerCase().replace('_', ' ')}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(contentPiece.createdAt)}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link
                href={`/campaigns/${contentPiece.campaign.id}`}
                className="btn btn-outline btn-md"
              >
                <Globe className="w-4 h-4 mr-2" />
                View Campaign
              </Link>
              <button 
                onClick={handleEditContent}
                className="btn btn-primary btn-md"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Content
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
                  <Link 
                    href={`/campaigns/${contentPiece.campaign.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {contentPiece.campaign.name}
                  </Link>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contentPiece.campaign.status)}`}>
                    {contentPiece.campaign.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Details</h2>
              <div className="space-y-4">
                {contentPiece.briefing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Briefing</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{contentPiece.briefing}</p>
                  </div>
                )}
                
                {contentPiece.targetAudience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <p className="text-gray-900">{contentPiece.targetAudience}</p>
                  </div>
                )}
                
                {contentPiece.tone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                    <p className="text-gray-900">{contentPiece.tone}</p>
                  </div>
                )}
                
                {contentPiece.keywords && contentPiece.keywords.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                    <div className="flex flex-wrap gap-2">
                      {contentPiece.keywords.map((keyword: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Versions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Versions</h2>
              {contentPiece.versions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No versions available yet.</p>
              ) : (
                <div className="space-y-4">
                  {contentPiece.versions.map((version: any) => (
                    <div key={version.id} className={`border rounded-lg p-4 ${version.isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVersionTypeColor(version.type)}`}>
                            {version.type.replace('_', ' ')}
                          </span>
                          {version.isActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                          <span className="text-sm text-gray-500">v{version.version}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(version.createdAt)}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{version.language}</span>
                        </div>
                        <p className="text-gray-900 bg-white p-3 rounded-md border text-sm leading-relaxed">
                          {version.content}
                        </p>
                      </div>
                      
                      {version.aiProvider && (
                        <div className="text-xs text-gray-500 mb-2">
                          Generated by {version.aiProvider} {version.aiModel && `(${version.aiModel})`}
                        </div>
                      )}
                      
                      {version.reviewNotes && (
                        <div className="mt-3">
                          <div className="flex items-center mb-1">
                            <MessageSquare className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm font-medium text-gray-700">Review Notes</span>
                          </div>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{version.reviewNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Review State */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Status</h3>
              <div className="flex items-center space-x-2">
                {getReviewStateIcon(contentPiece.reviewState)}
                <span className="font-medium capitalize">{contentPiece.reviewState.toLowerCase().replace('_', ' ')}</span>
              </div>
            </div>

            {/* Content Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Versions</span>
                  <span className="font-medium">{contentPiece.versions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Languages</span>
                  <span className="font-medium">
                    {Array.from(new Set(contentPiece.versions.map((v: any) => v.language))).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Source Language</span>
                  <span className="font-medium">{contentPiece.sourceLanguage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="font-medium">{formatDate(contentPiece.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="font-medium">{formatDate(contentPiece.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="w-full btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate AI Version
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowTranslateModal(true)}
                  disabled={isTranslating || contentPiece.versions.length === 0}
                  className="w-full btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Languages className="w-4 h-4 mr-2" />
                  Translate Content
                </button>
                <button 
                  onClick={() => setShowManualModal(true)}
                  disabled={isCreatingManual}
                  className="w-full btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Create Manual Version
                </button>
                <button 
                  onClick={handleEditContent}
                  className="w-full btn btn-primary btn-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Content
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Translate Modal */}
        {showTranslateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Translate Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Language
                  </label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select language...</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowTranslateModal(false);
                      setTargetLanguage('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTranslate}
                    disabled={!targetLanguage || isTranslating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTranslating ? 'Translating...' : 'Translate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Version Modal */}
        {showManualModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Manual Version</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    placeholder="Enter your content here..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowManualModal(false);
                      setManualContent('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateManual}
                    disabled={!manualContent.trim() || isCreatingManual}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingManual ? 'Creating...' : 'Create Version'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Content Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Edit Content Piece</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter content title"
                  />
                </div>

                {/* Briefing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Briefing
                  </label>
                  <textarea
                    value={editFormData.briefing}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, briefing: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter content briefing"
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={editFormData.targetAudience}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter target audience"
                  />
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone
                  </label>
                  <select
                    value={editFormData.tone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, tone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TONE_OPTIONS.map(tone => (
                      <option key={tone} value={tone}>{tone}</option>
                    ))}
                  </select>
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add keyword"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addKeyword(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addKeyword(input.value);
                          input.value = '';
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        Add
                      </button>
                    </div>
                    {editFormData.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editFormData.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => removeKeyword(keyword)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Review State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review State
                  </label>
                  <select
                    value={editFormData.reviewState}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, reviewState: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="AI_SUGGESTED">AI Suggested</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateContent}
                  disabled={!editFormData.title.trim() || isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update Content'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
