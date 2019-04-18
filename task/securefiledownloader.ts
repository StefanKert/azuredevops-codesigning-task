import fs = require("fs");
import Q = require("q");
import tl = require("azure-pipelines-task-lib/task");
import * as azuredevops from "azure-devops-node-api/WebApi";
import { ITaskAgentApi } from "azure-devops-node-api/TaskAgentApi";
import { IRequestHandler } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";

export class SecureFileDownloader {
    serverConnection: azuredevops.WebApi;

    constructor() {
        let serverUrl: string = tl.getVariable("System.TeamFoundationCollectionUri");
        let serverCreds: string = tl.getEndpointAuthorizationParameter("SYSTEMVSSCONNECTION", "ACCESSTOKEN", false);
        let authHandler: IRequestHandler = azuredevops.getPersonalAccessTokenHandler(serverCreds);
        this.serverConnection = new azuredevops.WebApi(serverUrl, authHandler);
    }

    async downloadSecureFile(secureFileId: string): Promise<string> {
        const tempDownloadPath: string = this.getSecureFileTempDownloadPath(secureFileId);

        tl.debug("Downloading secure file contents to: " + tempDownloadPath);
        const file: NodeJS.WritableStream = fs.createWriteStream(tempDownloadPath);

        const agentApi: ITaskAgentApi = await this.serverConnection.getTaskAgentApi();

        const secureFile: NodeJS.ReadableStream = await agentApi.downloadSecureFile(
            tl.getVariable("SYSTEM.TEAMPROJECT"),
            secureFileId,
            tl.getSecureFileTicket(secureFileId),
            false);

        const stream: NodeJS.WritableStream = secureFile.pipe(file);

        const defer: Q.Deferred<{}> = Q.defer();
        stream.on("finish", () => {
            defer.resolve();
        });
        await defer.promise;
        tl.debug("Downloaded secure file contents to: " + tempDownloadPath);
        return tempDownloadPath;
    }

    deleteSecureFile(secureFileId: string): void {
        const tempDownloadPath: string = this.getSecureFileTempDownloadPath(secureFileId);
        if (tl.exist(tempDownloadPath)) {
            tl.debug("Deleting secure file at: " + tempDownloadPath);
            tl.rmRF(tempDownloadPath);
        }
    }

    getSecureFileTempDownloadPath(secureFileId: string): string {
        const fileName: string = tl.getSecureFileName(secureFileId);
        return tl.resolve(tl.getVariable("Agent.TempDirectory"), fileName);
    }
}