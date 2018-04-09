import fs = require("fs");
import path = require("path");
import Q = require("q");
import tl = require("vsts-task-lib/task");
import * as vsts from "vso-node-api/WebApi";
import { IRequestHandler } from "typed-rest-client/Interfaces";
import { ITaskAgentApi } from "vso-node-api/TaskAgentApi";

export class SecureFileDownloader {
    serverConnection: vsts.WebApi;

    constructor() {
        let serverUrl: string = tl.getVariable("System.TeamFoundationCollectionUri");
        let serverCreds: string = tl.getEndpointAuthorizationParameter("SYSTEMVSSCONNECTION", "ACCESSTOKEN", false);
        let authHandler: IRequestHandler = vsts.getPersonalAccessTokenHandler(serverCreds);

        this.serverConnection = new vsts.WebApi(serverUrl, authHandler);
    }

    async downloadSecureFile(secureFileId: string): Promise<string> {
        let tempDownloadPath: string = this.getSecureFileTempDownloadPath(secureFileId);

        tl.debug("Downloading secure file contents to: " + tempDownloadPath);
        let file: NodeJS.WritableStream = fs.createWriteStream(tempDownloadPath);

        let taskAgentApi : ITaskAgentApi = await this.serverConnection.getTaskAgentApi();
        var secureFile : NodeJS.ReadableStream = await taskAgentApi.downloadSecureFile(
            tl.getVariable("SYSTEM.TEAMPROJECT"),
            secureFileId,
            tl.getSecureFileTicket(secureFileId),
            false);
        let stream : NodeJS.WritableStream = secureFile.pipe(file);
        let defer : Q.Deferred<{}> = Q.defer();
        stream.on("finish", () => {
            defer.resolve();
        });
        await defer.promise;
        tl.debug("Downloaded secure file contents to: " + tempDownloadPath);
        return tempDownloadPath;
    }

    deleteSecureFile(secureFileId: string): void {
        let tempDownloadPath: string = this.getSecureFileTempDownloadPath(secureFileId);
        if (tl.exist(tempDownloadPath)) {
            tl.debug("Deleting secure file at: " + tempDownloadPath);
            tl.rmRF(tempDownloadPath);
        }
    }

    getSecureFileTempDownloadPath(secureFileId: string): string {
        let fileName: string = tl.getSecureFileName(secureFileId);
        let tempDownloadPath: string = tl.resolve(tl.getVariable("Agent.TempDirectory"), fileName);
        return tempDownloadPath;
    }
}