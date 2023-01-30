import { formatJSONResponse } from "@libs/apiGateway";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { dynamo } from "@libs/dynamo";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const body = JSON.parse(event.body);
    const tableName = process.env.roomConnectionTable;
    const { connectionId, domainName, stage } = event.requestContext;

    if (!body.name) {
      await websocket.send({
        data: {
          message: "Please provide a name on createRoom",
          type: "err",
        }
      })
      return formatJSONResponse({});
    }

    

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
