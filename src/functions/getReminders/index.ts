import { formatJSONResponse } from "@libs/apiGateway";
import { APIGatewayProxyEvent } from "aws-lambda";
import { dynamo } from "@libs/dynamo";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const tableName = process.env.reminderTable;

    const { userId } = event.pathParameters || {};

    if (!userId) {
      return formatJSONResponse({
        statusCode: 400,
        data: {
          message: "userId is required",
        },
      });
    }
    const data = await dynamo.query({
      tableName,
      index: "index1",
      pkValue: userId,
    });

    return formatJSONResponse({ data });
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
