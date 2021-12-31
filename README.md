# graphql-codegen-flutter-artemis-hooks

this is graphql-codegen plugin to generate Flutter artemis hooks.

## How to use

### Install

```
npm i graphql-codegen-flutter-artemis-hooks
```

### Edit codegen.yml

you need to specify path for generated file by artemis

```
schema: your_schema_file.graphql
documents: './your_project/**/*.graphql'
generates:
  test/output.dart:
    config:
      artemisImportPath: package:your_project/your_artemis_generated/graphql_api.dart
    plugins:
      - graphql-codegen-flutter-artemis-hooks
```

then run the plugin!!

## What it generates

for instance, if you have defined GraphQL as following

```
query ExampleQuery {
  objects {
    id
    name
  }
}

mutation TestMutation($variable: String!) {
  testMutation(variable: $variable) {
    result
  }
}
```

and using this plugin would generate code like this.

```
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:gql/ast.dart';
import 'package:your_project/your_artemis_generated/graphql_api.dart';

QueryResult useQuery<DataType>(BuildContext context, DocumentNode query,
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
}

class ExampleQuery$QueryReturnType {
  bool isLoading;
  OperationException? exception;
  ExampleQuery$Query? data;

  ExampleQuery$QueryReturnType(this.isLoading, this.exception, this.data);
}

ExampleQuery$QueryReturnType useExampleQueryQuery<DataType>(BuildContext context) {
  final result = useQuery<ExampleQuery$Query>(context, EXAMPLE_QUERY_QUERY_DOCUMENT);
  return ExampleQuery$QueryReturnType(result.isLoading, result.exception, result.data == null ? null : ExampleQuery$Query.fromJson(result.data!));
}

    class TestMutation$MutationReturnType {
  bool isLoading;
  OperationException? exception;
  TestMutation$Mutation? data;

  TestMutation$MutationReturnType(this.isLoading, this.exception, this.data);
}

TestMutation$MutationReturnType useTestMutationQuery<DataType>(BuildContext context, TestMutationArguments variables) {
  final result = useQuery<TestMutation$Mutation>(context, TEST_MUTATION_MUTATION_DOCUMENT, variables.toJson());
  return TestMutation$MutationReturnType(result.isLoading, result.exception, result.data == null ? null : TestMutation$Mutation.fromJson(result.data!));
}
```

Then you can use the generated type-safe hooks as following

```
class PageWidget extends HookWidget {
  const PageWidget({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final queryResult = useExampleQueryQuery(context);
    final mutationResult = useTestMutationQuery(context, TestMutationArguments(variable: ""));

    return ...
  }
}
```

## Prerequisite

This project is assumes you would use the following packages

- [flutter_hooks](https://pub.dev/packages/flutter_hooks)
- [graphql_flutter](https://pub.dev/packages/graphql_flutter)
- [artemis](https://pub.dev/packages/artemis)

## Configuration

- `artemisImportPath`: path to your generated file by artemis
- `isNonNullSafety` (default: null): set this to `true` if you want to generate code that is not null safety
