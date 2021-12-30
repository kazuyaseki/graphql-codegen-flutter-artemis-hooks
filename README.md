# graphql-codegen-flutter-artemis-hooks

Generate Flutter artemis hooks

## Motivations

## Configuration

- `isNonNullSafety` (default: null): regexp to exclude operation names

## Example config

```
overwrite: true
schema:
    - 'https://myschema/graphql'
documents:
    - 'src/**/*.graphql'
generates:
    src/@types/codegen/page.tsx:
        config:
            documentMode: external
            importDocumentNodeExternallyFrom: ./graphql
        preset: import-types
        presetConfig:
            typesPath: ./graphql
        plugins:
            - ./build/src/index.js
```
