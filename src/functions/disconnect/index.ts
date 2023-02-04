import { formatJSONResponse } from "@libs/apiGateway";
import { APIGatewayProxyEvent } from "aws-lambda";
import { dynamo } from "@libs/dynamo";
import { UserConnectionRecord } from "src/types/dynamo";
import { websocket } from "@libs/websocket";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const tableName = process.env.roomConnectionTable;
    // destructuring the requestContext object
    const { connectionId} = event.requestContext;
    
    await dynamo.delete(connectionId, tableName);

    return formatJSONResponse({});
  } catch (error) {
    console.log(error);
    return formatJSONResponse({
      statusCode: 502,
      data: {
        message: error.message,
      },
    });
  }
};
