import path = require("path");
import tl = require("vsts-task-lib/task");
import exec = require("child_process");
import sec = require("./securefiledownloader");

async function run(): Promise<void> {
  let secureFileId: string;
  let signCertPassword: string;
  let filePath: string;
  let timeServer: string;
  let hashingAlgorithm: string;
  let secureFileHelpers: sec.SecureFileDownloader;
  let secureFilePath: string;
  try {
    tl.setResourcePath(path.join(__dirname, "task.json"));
    secureFileId = tl.getInput("secureFileId", true);
    signCertPassword = tl.getInput("signCertPassword", true);
    filePath = tl.getInput("filePath", true);
    timeServer = tl.getInput("timeServer", true);
    hashingAlgorithm = tl.getInput("hashingAlgorithm", true);    

    console.log("Downloadig secure file " + secureFileId);
    secureFileHelpers = new sec.SecureFileDownloader();
    secureFilePath = await secureFileHelpers.downloadSecureFile(secureFileId);

    console.log("Signing file");
    var exePath: string = path.resolve(__dirname, "./signtool.exe");
    console.log("Executing signtool at " + exePath);
    exec.execFile(exePath, ["sign", "/fd", hashingAlgorithm, "/t", timeServer, "/f", secureFilePath, "/p", signCertPassword, filePath],
      (err, data) => {
        if (err) {
          console.error("Signtool failed. Output: ");
          console.error(err);
          tl.setResult(tl.TaskResult.Failed, err.message);
        } else {
          console.log("Signtool succeeded. Output: ");
          console.log(data);
        }
        console.log("Deleting securfile");
        console.log("Job Finished: Successfully signed file " + filePath + " with certificate in " + secureFilePath);
      });
  } catch (err) {
    console.error(err);
    secureFileHelpers.deleteSecureFile();
    tl.setResult(tl.TaskResult.Failed, err);
  }
}

run();