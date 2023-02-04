import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  PostToConnectionCommandInput,
} from "@aws-sdk/client-apigatewaymanagementapi";

export const websocket = {
  createClient: ({
    domainName,
    stage,
  }: {
    domainName: string;
    stage: string;
  }) => {
    const client = new ApiGatewayManagementApiClient({
      endpoint: `https://${domainName}/${stage}`,
    });
    return client;
  },

  send: ({
    data,
    connectionId,
    domainName,
    stage,
  }: {
    data: {
      message?: string;
      type?: string;
      from?: string;
    };
    stage: string;
    domainName: string;
    connectionId: string;
  }) => {
    const client = new ApiGatewayManagementApiClient({
      endpoint: `https://${domainName}/${stage}`,
    });

    const params: PostToConnectionCommandInput = {
      ConnectionId: connectionId,
      Data: JSON.stringify(data) as any,
    };

    const command = new PostToConnectionCommand(params);

    return client.send(command);
  },
};
