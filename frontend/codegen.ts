import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',
  documents: ['src/**/*.tsx', 'src/**/*.ts'],
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
    './src/graphql/generated/introspection.json': {
      plugins: ['introspection'],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
