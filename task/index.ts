import path = require("path");
import tl = require("azure-pipelines-task-lib/task");
import exec = require("child_process");
import * as sec from "./securefiledownloader";
import { IExecSyncResult } from "azure-pipelines-task-lib/toolrunner";

async function run(): Promise<void> {
  tl.setResourcePath(path.join(__dirname, "task.json"));
  let secureFileId: string;
  let signCertPassword: string;
  let timeServer: string;
  let hashingAlgorithm: string;
  let secureFileHelpers: sec.SecureFileDownloader;

  try {
    secureFileId = tl.getInput("secureFileId", true);
    signCertPassword = tl.getInput("signCertPassword", true);
    timeServer = tl.getInput("timeServer", true);
    hashingAlgorithm = tl.getInput("hashingAlgorithm", true);

    let filePaths: string[] = tl.getDelimitedInput("filePaths", "\n", true);
    let rootFolder: string = tl.getPathInput("rootFolder", true, true);

    rootFolder = path.normalize(rootFolder);

    let allPaths: string[] = tl.find(rootFolder);
    let matchedPaths: string[] = tl.match(allPaths, filePaths, rootFolder); // default match options
    let matchedFiles: string[] = matchedPaths.filter((itemPath: string) => !tl.stats(itemPath).isDirectory()); // filter-out directories
    if (matchedFiles.length > 0) {
      console.log("Downloadig secure file " + secureFileId);
      secureFileHelpers = new sec.SecureFileDownloader();
      try {
        let secureFilePath: string = await secureFileHelpers.downloadSecureFile(secureFileId);
        var exePath: string = path.resolve(__dirname, "./signtool.exe");
        console.log("Executing signtool at " + exePath);

        matchedFiles.forEach((filePath: string) => {
          console.log("Signing file: " + filePath);
          let result: IExecSyncResult = tl.execSync(
            exePath, ["sign", "/fd", hashingAlgorithm, "/t", timeServer, "/f", secureFilePath, "/p", signCertPassword, filePath]);
          if (result.error) {
            console.error("Signtool failed. Output: ");
            console.error(result.error);
            tl.setResult(tl.TaskResult.Failed, result.error.message);
          } else {
            console.log("Signtool succeeded. Output: ");
            console.log(result.stdout);
          }
          console.log("Job Finished: Successfully signed file " + filePath + " with certificate in " + secureFilePath);
        });
      } catch (err) {
        tl.setResult(tl.TaskResult.Failed, `${err}`);
      } finally {
        secureFileHelpers.deleteSecureFile(secureFileId);
      }
    } else {
      tl.setResult(tl.TaskResult.SucceededWithIssues, "No files matching the pattern");
    }
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, `${err}`);
  }
}

run();