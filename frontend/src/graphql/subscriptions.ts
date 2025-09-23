import { gql } from '@apollo/client';

export const CAMPAIGN_CREATED = gql`
  subscription CampaignCreated {
    campaignCreated {
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

export const CAMPAIGN_UPDATED = gql`
  subscription CampaignUpdated {
    campaignUpdated {
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

export const CONTENT_PIECE_CREATED = gql`
  subscription ContentPieceCreated {
    contentPieceCreated {
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

export const CONTENT_PIECE_UPDATED = gql`
  subscription ContentPieceUpdated {
    contentPieceUpdated {
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

export const AI_CONTENT_GENERATED = gql`
  subscription AiContentGenerated {
    aiContentGenerated {
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
      contentPiece {
        id
        title
        reviewState
      }
    }
  }
`;

export const CONTENT_TRANSLATED = gql`
  subscription ContentTranslated {
    contentTranslated {
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
      contentPiece {
        id
        title
      }
    }
  }
`;

export const VERSION_UPDATED = gql`
  subscription VersionUpdated {
    versionUpdated {
      id
      content
      type
      reviewNotes
      updatedAt
      contentPiece {
        id
        title
      }
    }
  }
`;

export const ACTIVE_VERSION_CHANGED = gql`
  subscription ActiveVersionChanged {
    activeVersionChanged {
      id
      isActive
      updatedAt
      contentPiece {
        id
        title
      }
    }
  }
`;
