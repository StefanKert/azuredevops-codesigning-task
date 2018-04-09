import path = require("path");
import tl = require("vsts-task-lib/task");
import exec = require("child_process");
import { SecureFileDownloader } from "./securefiledownloader";

async function run(): Promise<void> {
  let secureFileId: string;
  let signCertPassword: string;
  let filePath: string;
  let secureFileHelpers: SecureFileDownloader;
  let secureFilePath: string;
  try {
    tl.setResourcePath(path.join(__dirname, "task.json"));
    secureFileId = tl.getInput("secureFileId", true);
    signCertPassword = tl.getInput("signCertPassword", true);
    filePath = tl.getInput("filePath", true);

    console.log("Downloadig secure file " + secureFileId);
    secureFileHelpers = new SecureFileDownloader();
    secureFilePath = await secureFileHelpers.downloadSecureFile(secureFileId);

    console.log("Signing file");
    var exePath: string = path.resolve(__dirname, "./signtool.exe");
    console.log("Executing signtool at " + exePath);
    exec.execFile(
      exePath,
      [
        "sign",
        "/fd",
        "SHA256",
        "/t",
        "http://timestamp.digicert.com",
        "/f",
        secureFilePath,
        "/p",
        signCertPassword,
        filePath
      ],
      (err, data) => {
        if (err) {
          console.error(err);
          tl.setResult(tl.TaskResult.Failed, err.message);
        } else {
          console.log(
            "Successfully signed file " +
              filePath +
              " with certificate in " +
              secureFilePath
          );
        }
      }
    );
  } catch (err) {
    console.error(err);
    tl.setResult(tl.TaskResult.Failed, err);
  } finally {
    secureFileHelpers.deleteSecureFile(secureFilePath);
  }
}

run();
