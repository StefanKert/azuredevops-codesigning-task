import mockanswer = require("azure-pipelines-task-lib/mock-answer");
import tmrm = require("azure-pipelines-task-lib/mock-run");
import path = require("path");

let taskPath: string = path.join(__dirname, "../task", "codesigning.js");
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

const signToolPath: string = path.normalize(path.join(__dirname, "../task", "signtool.exe"));
const secureFileId: string = "THESECUREFILEID";
const signCertPassword: string = "PASSWORD";
const timeServer: string = "http://timestamp.digicert.com";
const hashingAlgorithm: string = "SHA256";
const files: string = "**/*.+(file|file0|file2|file3)";
const certificatePath: string = path.join(__dirname, "./test-files", "TestCertificate.pfx");
const expectedFiles: string[] = [
    "/srcDir/file3.file0",
    "/srcDir/someOtherDir/file1.file",
    "/srcDir/someOtherDir/file2.file2",
    "/srcDir/someOtherDir2/file1.file",
    "/srcDir/someOtherDir2/file2.file3",
    "/srcDir/someOtherDir2/file3.file"
];

tmr.setInput("secureFileId", secureFileId);
tmr.setInput("signCertPassword", signCertPassword);
tmr.setInput("timeServer", timeServer);
tmr.setInput("hashingAlgorithm", hashingAlgorithm);
tmr.setInput("files", files);

process.env["VSTS_TASKVARIABLE_SECURE_FILE_PATH"] = certificatePath;

let answers: mockanswer.TaskLibAnswers = <mockanswer.TaskLibAnswers>{
    findMatch: {},
    exec: {}
};

answers.findMatch[files] = expectedFiles;
for (let expectedFile of expectedFiles) {
    // tslint:disable-next-line:max-line-length
    answers.exec[`${signToolPath} sign /fd ${hashingAlgorithm} /t ${timeServer} /f ${certificatePath} /p ${signCertPassword} ${expectedFile}`] = {
        code: 0,
        stdout: `Successfully signed ${expectedFile}`
    };
}

tmr.setAnswers(answers);

tmr.run();