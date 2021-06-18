import path = require("path");
import tl = require("azure-pipelines-task-lib/task");
import * as sec from "./securefiledownloader";

async function run(): Promise<void> {
    let secureFileId: string;
    let secureFileHelper: sec.SecureFileDownloader = new sec.SecureFileDownloader();
    try {
        tl.setResourcePath(path.join(__dirname, "task.json"));
        
        let secureFilePath: string;
        let secureFileLocation: string = tl.getInput("secureFileLocation", true);
        if (secureFileLocation == "azure") {
            secureFileId = tl.getInput("secureFileId", true);
            secureFilePath = await secureFileHelper.downloadSecureFile(secureFileId);
        }
        else if (secureFileLocation == "filepath")
            secureFilePath = tl.getInput("secureFileLocalPath", true);
        else
            throw "The configured secure file location is invalid."

        tl.setTaskVariable("SECURE_FILE_PATH", secureFilePath);
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
}

run();
