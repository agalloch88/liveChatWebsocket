import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  PutCommandInput,
  GetCommand,
  GetCommandInput,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";

const dyanmoClient = new DynamoDBClient({});
export const dynamo = {
  // Write data to a table
  write: async (data: Record<string, any>, tableName: string) => {
    const params: PutCommandInput = {
      TableName: tableName,
      Item: data,
    };
    const command = new PutCommand(params);

    await dyanmoClient.send(command);

    return data;
  },
  // Read data from a table
  get: async (id: string, tableName: string) => {
    const params: GetCommandInput = {
      TableName: tableName,
      Key: {
        id,
      },
    };
    const command = new GetCommand(params);
    const response = await dyanmoClient.send(command);

    return response.Item;
  },
  // Query a table
  query: async ({
    tableName,
    index,
    pkValue,
    pkKey = "pk",
    skValue,
    skKey = "sk",
    sortAscending = true,
  }: {
    tableName: string;
    index: string;
    pkValue: string;
    pkKey?: string;
    skValue?: string;
    skKey?: string;
    sortAscending?: boolean;
  }) => {
    // If there is a sort key, add it to the query
    const skExpression = skValue ? ` and ${skKey} = :rangeValue` : "";

    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: index,
      KeyConditionExpression: `${pkKey} = :hashValue${skExpression}`,
      ExpressionAttributeValues: {
        ":hashValue": pkValue,
      },
    };
    // If there is a sort key expression, add it to the params
    if (skValue) {
      params.ExpressionAttributeValues[":rangeValue"] = skValue;
    }

    const command = new QueryCommand(params);
    const res = await dyanmoClient.send(command);
    return res.Items;
  },
};
