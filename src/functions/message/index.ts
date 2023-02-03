import { formatJSONResponse } from "@libs/apiGateway";
import { APIGatewayProxyEvent } from "aws-lambda";
import { dynamo } from "@libs/dynamo";
import { UserConnectionRecord } from "src/types/dynamo";
import { websocket } from "@libs/websocket";

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

    const existingUser = await dynamo.get<UserConnectionRecord>(
      connectionId,
      tableName
    );

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

    const { roomCode } = existingUser;

    const roomUsers = await dynamo.query<UserConnectionRecord>({
      pkValue: roomCode,
      tableName,
      index: "index1",
    });

    const messagePromiseArray = roomUsers.filter(() => {

    }).map((user) => {
      const { id: connectionId, domainName, stage } = user;

      return websocket.send({
        data: {
          message,
          from: existingUser.name,
        },
        connectionId,
        domainName,
        stage,
      });
    });

    await Promise.all(messagePromiseArray);

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
