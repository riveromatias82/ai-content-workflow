import { gql } from '@apollo/client';

export const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign($createCampaignInput: CreateCampaignInputType!) {
    createCampaign(createCampaignInput: $createCampaignInput) {
      id
      name
      description
      status
      targetLanguages
      targetMarkets
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CAMPAIGN = gql`
  mutation UpdateCampaign($id: ID!, $updateCampaignInput: UpdateCampaignInputType!) {
    updateCampaign(id: $id, updateCampaignInput: $updateCampaignInput) {
      id
      name
      description
      status
      targetLanguages
      targetMarkets
      updatedAt
    }
  }
`;

export const DELETE_CAMPAIGN = gql`
  mutation DeleteCampaign($id: ID!) {
    removeCampaign(id: $id)
  }
`;

export const CREATE_CONTENT_PIECE = gql`
  mutation CreateContentPiece($createContentPieceInput: CreateContentPieceInputType!) {
    createContentPiece(createContentPieceInput: $createContentPieceInput) {
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
    }
  }
`;

export const UPDATE_CONTENT_PIECE = gql`
  mutation UpdateContentPiece($id: ID!, $updateContentPieceInput: UpdateContentPieceInputType!) {
    updateContentPiece(id: $id, updateContentPieceInput: $updateContentPieceInput) {
      id
      title
      reviewState
      briefing
      targetAudience
      tone
      keywords
      updatedAt
    }
  }
`;

export const DELETE_CONTENT_PIECE = gql`
  mutation DeleteContentPiece($id: ID!) {
    removeContentPiece(id: $id)
  }
`;

export const GENERATE_AI_CONTENT = gql`
  mutation GenerateAiContent($generateAiContentInput: GenerateAiContentInputType!) {
    generateAiContent(generateAiContentInput: $generateAiContentInput) {
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
      createdAt
      contentPiece {
        id
        reviewState
      }
    }
  }
`;

export const TRANSLATE_CONTENT = gql`
  mutation TranslateContent($translateContentInput: TranslateContentInputType!) {
    translateContent(translateContentInput: $translateContentInput) {
      id
      content
      language
      type
      aiProvider
      aiModel
      sentimentAnalysis
      version
      isActive
      createdAt
    }
  }
`;

export const CREATE_MANUAL_VERSION = gql`
  mutation CreateManualVersion($createManualVersionInput: CreateManualVersionInputType!) {
    createManualVersion(createManualVersionInput: $createManualVersionInput) {
      id
      content
      language
      type
      version
      isActive
      createdAt
    }
  }
`;

export const UPDATE_VERSION = gql`
  mutation UpdateVersion($updateVersionInput: UpdateVersionInputType!) {
    updateVersion(updateVersionInput: $updateVersionInput) {
      id
      content
      type
      reviewNotes
      updatedAt
    }
  }
`;

export const SET_ACTIVE_VERSION = gql`
  mutation SetActiveVersion($id: ID!) {
    setActiveVersion(id: $id) {
      id
      isActive
      updatedAt
    }
  }
`;
