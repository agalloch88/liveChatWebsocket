import { formatJSONResponse } from "@libs/apiGateway";
import { APIGatewayProxyEvent } from "aws-lambda";
import { dynamo } from "@libs/dynamo";
import { UserConnectionRecord } from "src/types/dynamo";
import { websocket } from "@libs/websocket";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const {name, roomCode} = JSON.parse(event.body);
    const tableName = process.env.roomConnectionTable;
    // destructuring the requestContext object
    const { connectionId, domainName, stage } = event.requestContext;
    // if the name is not provided, send an error message
    if (!name) {
      await websocket.send({
        data: {
          message: "Please provide a name on joinRoom",
          type: "err",
        },
        connectionId,
        domainName,
        stage,
      });
      return formatJSONResponse({});
    }

    if (!roomCode) {
      await websocket.send({
        data: {
          message: "Please provide a roomCode on joinRoom",
          type: "err",
        },
        connectionId,
        domainName,
        stage,
      });
      return formatJSONResponse({});
    }
    
    const roomUsers = await dynamo.query({
      pkValue: roomCode,
      tableName,
      index: 'index1',
      limit: 1,
    })

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
