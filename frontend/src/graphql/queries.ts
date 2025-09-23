import { gql } from '@apollo/client';

export const GET_CAMPAIGNS = gql`
  query GetCampaigns {
    campaigns {
      id
      name
      description
      status
      targetLanguages
      targetMarkets
      createdAt
      updatedAt
      contentPieces {
        id
        title
        type
        reviewState
        createdAt
        updatedAt
        versions {
          id
          content
          language
          type
          isActive
          createdAt
        }
      }
    }
  }
`;

export const GET_CAMPAIGN = gql`
  query GetCampaign($id: ID!) {
    campaign(id: $id) {
      id
      name
      description
      status
      targetLanguages
      targetMarkets
      createdAt
      updatedAt
      contentPieces {
        id
        title
        type
        reviewState
        briefing
        targetAudience
        tone
        keywords
        sourceLanguage
        createdAt
        updatedAt
        versions {
          id
          content
          language
          type
          aiProvider
          aiModel
          sentimentAnalysis
          version
          isActive
          reviewNotes
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const GET_CAMPAIGN_STATS = gql`
  query GetCampaignStats($id: ID!) {
    campaignStats(id: $id) {
      totalContentPieces
      draftCount
      aiSuggestedCount
      underReviewCount
      approvedCount
      rejectedCount
    }
  }
`;

export const GET_CONTENT_PIECES = gql`
  query GetContentPieces {
    contentPieces {
      id
      title
      type
      reviewState
      briefing
      targetAudience
      tone
      keywords
      sourceLanguage
      createdAt
      updatedAt
      campaign {
        id
        name
      }
      versions {
        id
        content
        language
        type
        aiProvider
        isActive
        createdAt
      }
    }
  }
`;

export const GET_CONTENT_PIECE = gql`
  query GetContentPiece($id: ID!) {
    contentPiece(id: $id) {
      id
      title
      type
      reviewState
      briefing
      targetAudience
      tone
      keywords
      sourceLanguage
      createdAt
      updatedAt
      campaign {
        id
        name
        status
      }
      versions {
        id
        content
        language
        type
        aiProvider
        aiModel
        aiMetadata
        sentimentAnalysis
        version
        isActive
        reviewNotes
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_CONTENT_PIECES_BY_CAMPAIGN = gql`
  query GetContentPiecesByCampaign($campaignId: ID!) {
    contentPiecesByCampaign(campaignId: $campaignId) {
      id
      title
      type
      reviewState
      briefing
      targetAudience
      tone
      keywords
      sourceLanguage
      createdAt
      updatedAt
      versions {
        id
        content
        language
        type
        aiProvider
        aiModel
        sentimentAnalysis
        version
        isActive
        reviewNotes
        createdAt
        updatedAt
      }
    }
  }
`;
