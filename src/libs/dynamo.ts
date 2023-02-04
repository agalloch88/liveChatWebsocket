import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  PutCommandInput,
  GetCommand,
  GetCommandInput,
  QueryCommand,
  QueryCommandInput,
  DeleteCommand,
  DeleteCommandInput,
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
  get: async <T = Record<string, any>>(id: string, tableName: string) => {
    const params: GetCommandInput = {
      TableName: tableName,
      Key: {
        id,
      },
    };
    const command = new GetCommand(params);
    const response = await dyanmoClient.send(command);

    return response.Item as T;
  },
  // Query a table
  query: async <T = Record<string, any>> ({
    tableName,
    index,
    pkValue,
    pkKey = "pk",
    skValue,
    skKey = "sk",
    sortAscending = true,
    limit
  }: {
    tableName: string;
    index: string;
    pkValue: string;
    pkKey?: string;
    skValue?: string;
    skKey?: string;
    sortAscending?: boolean;
    limit?: number;
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
      Limit: limit,
    };
    // If there is a sort key expression, add it to the params
    if (skValue) {
      params.ExpressionAttributeValues[":rangeValue"] = skValue;
    }

    const command = new QueryCommand(params);
    const res = await dyanmoClient.send(command);
    return res.Items as T[];
  },

  delete: (id: string, tableName: string) => {
    const params: DeleteCommandInput = {
      TableName: tableName,
      Key: {
        id
      }
    }
    const command = new DeleteCommand(params);

    return dyanmoClient.send(command);
  }
};
