import { formatJSONResponse } from "@libs/apiGateway";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { dynamo } from "@libs/dynamo";
import { UserConnectionRecord } from "src/types/dynamo";
import { websocket } from "@libs/websocket";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const body = JSON.parse(event.body);
    const tableName = process.env.roomConnectionTable;
    // destructuring the requestContext object
    const { connectionId, domainName, stage } = event.requestContext;
    // if the name is not provided, send an error message
    if (!body.name) {
      await websocket.send({
        data: {
          message: "Please provide a name on createRoom",
          type: "err",
        },
        connectionId,
        domainName,
        stage,
      });
      return formatJSONResponse({});
    }
    // generate a random room code
    const roomCode = uuid().slice(0, 8);
    // create a new record to send to the database
    const data: UserConnectionRecord = {
      id: connectionId,
      pk: roomCode,
      sk: connectionId,
      name: body.name,
      domainName,
      stage,
      roomCode,
    };
    // write the record to the database
    await dynamo.write(data, tableName);
    // send a message to the user that they have successfully connected
    await websocket.send({
      data: {
        message: `You are now connected to room ${roomCode}`,
        type: "info",
      },
      connectionId,
      domainName,
      stage,
    });

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
