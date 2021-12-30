import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export type FlutterArtemisHooksPluginConfig = RawClientSideBasePluginConfig &
  Config;

export type Config = {
  isNonNullSafety?: string;
};
