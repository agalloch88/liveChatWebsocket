import { formatJSONResponse } from "@libs/apiGateway";
import { APIGatewayProxyEvent } from "aws-lambda";
import { dynamo } from "@libs/dynamo";
import { UserConnectionRecord } from "src/types/dynamo";
import { websocket } from "@libs/websocket";
import { UserConnectionRecord } from '../../types/dynamo.d';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const { message } = JSON.parse(event.body);
    const tableName = process.env.roomConnectionTable;
    // destructuring the requestContext object
    const { connectionId, domainName, stage } = event.requestContext;
    // if the name is not provided, send an error message
    if (!message) {
      await websocket.send({
        data: {
          message: "Please provide a message on message actions",
          type: "err",
        },
        connectionId,
        domainName,
        stage,
      });
      return formatJSONResponse({});
    }

    const existingUser = await dynamo.get<UserConnectionRecord>(connectionId, tableName);

    if (!existingUser) {
      await websocket.send({
        data: {
          message: "Please create or join a room",
          type: "err",
        },
        connectionId,
        domainName,
        stage,
      });
      return formatJSONResponse({});
    }

    const { name, roomCode } = existingUser;

    const roomUsers = await dynamo.query({
      pkValue: roomCode,
      tableName,
      index: "index1",
      limit: 1,
    });

    if (roomUsers.length === 0) {
      await websocket.send({
        data: {
          message: "No room with that code exists. Please create a room.",
          type: "err",
        },
        connectionId,
        domainName,
        stage,
      });
      return formatJSONResponse({});
    }

    // create a new record to send to the database
    const data: UserConnectionRecord = {
      id: connectionId,
      pk: roomCode,
      sk: connectionId,
      name,
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
