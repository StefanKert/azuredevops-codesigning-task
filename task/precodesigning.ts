import path = require("path");
import tl = require("azure-pipelines-task-lib/task");
import * as sec from "./securefiledownloader";

async function run(): Promise<void> {
    let secureFileId: string;
    let secureFileHelper: sec.SecureFileDownloader = new sec.SecureFileDownloader();
    try {
        tl.setResourcePath(path.join(__dirname, "task.json"));

        secureFileId = tl.getInput("secureFileId", true);
        let secureFilePath: string = await secureFileHelper.downloadSecureFile(secureFileId);
        tl.setTaskVariable("SECURE_FILE_PATH", secureFilePath);
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
}

run();
