import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import {
  GraphQLSchema,
  Kind,
  concatAST,
  OperationDefinitionNode,
  OperationTypeNode,
} from 'graphql';

import { FlutterArtemisHooksPluginConfig } from './config';

export const plugin: PluginFunction<
  FlutterArtemisHooksPluginConfig,
  Types.ComplexPluginOutput
> = (
  _schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  _config: FlutterArtemisHooksPluginConfig
) => {
  console.log('hige');
  const allAst = concatAST(documents.map((v) => v.document));

  console.log(allAst.definitions.map((d) => d.kind));

  const allQueryies: OperationDefinitionNode[] = allAst.definitions.filter(
    (d) => d.kind === Kind.OPERATION_DEFINITION
  ) as OperationDefinitionNode[];

  console.log(allQueryies);

  const queryBuilder = (
    queryName: string,
    operationType: OperationTypeNode,
    hasVariables: boolean,
    isNullSafety: boolean
  ) => {
    const operationStr = capitalizeFirstLetter(operationType);

    return `class ${queryName}$${operationStr}ReturnType {
  bool isLoading;
  OperationException${isNullSafety ? '?' : ''} exception;
  ${queryName}$${operationStr}${isNullSafety ? '?' : ''} data;

  ${queryName}$${operationStr}ReturnType(this.isLoading, this.exception, this.data);
}

${queryName}$${operationStr}ReturnType use${queryName}Query<DataType>(BuildContext context${
      hasVariables ? `, ${queryName}Arguments variables` : ''
    }) {
  final result = useQuery<${queryName}$${operationStr}>(context, ${queryName
      .match(/[A-Z][a-z]+/g)
      .map((s) => s.toUpperCase())
      .join('_')}_${operationStr.toUpperCase()}_DOCUMENT${
      hasVariables ? `, variables.toJson()` : ''
    });
  return ${queryName}$${operationStr}ReturnType(result.isLoading, result.exception, result.data == null ? null : ${queryName}$${operationStr}.fromJson(result.data${
      isNullSafety ? '!' : ''
    }));
}`;
  };

  console.log(allQueryies);

  return {
    content:
      packagesImportStr(
        'package:pocket_musubi_native/service/graphql_client_service/generated/graphql_api.dart'
      ) +
      useQueryString(true) +
      allQueryies.map((q) =>
        queryBuilder(
          q.name.value,
          q.operation,
          q.variableDefinitions?.length > 0,
          true
        )
      ).join(`
    
    `),
  };
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const packagesImportStr = (
  artemisImportPath: string
) => `import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:gql/ast.dart';
import '${artemisImportPath}';

`;

const useQueryString = (isNullSafety: boolean) =>
  isNullSafety
    ? `QueryResult useQuery<DataType>(BuildContext context, DocumentNode query,
    [Map<String, dynamic>? variables]) {
  final client = GraphQLProvider.of(context).value;
  final state =
      useState<QueryResult>(QueryResult(source: QueryResultSource.network));

  useEffect(() {
    late Future<QueryResult> promise;

    if (variables != null) {
      promise = client.query(
        QueryOptions(document: query, variables: variables),
      );
    } else {
      promise = client.query(
        QueryOptions(document: query),
      );
    }
    promise.then((result) {
      state.value = result;
    });

    return () {};
  }, []);
  return state.value;
}`
    : `
QueryResult useQuery<DataType>(
    BuildContext context, DocumentNode query,
    [Object variables]) {
  final client = GraphQLProvider.of(context).value;
  final state = useState<QueryResult>(QueryResult());

  useEffect(() {
    final promise = client.query(
      QueryOptions(document: query, variables: variables),
    );
    promise.then((result) {
      state.value = result;
    });
    return () {};
  }, []);
  return state.value;
}

`;
