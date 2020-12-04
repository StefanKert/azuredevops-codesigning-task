import mockanswer = require("azure-pipelines-task-lib/mock-answer");
import tmrm = require("azure-pipelines-task-lib/mock-run");
import path = require("path");

let taskPath: string = path.join(__dirname, "../task", "codesigning.js");
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

const secureFileId: string = "THESECUREFILEID";
const signCertPassword: string = "PASSWORD";
const timeServer: string = "http://timestamp.digicert.com";
const hashingAlgorithm: string = "SHA256";
const fileToSign: string = "DllToSign.dll";

const signToolPath: string = path.normalize(path.join(__dirname, "../task", "signtool.exe"));
const certificatePath: string = path.join(__dirname, "./test-files", "TestCertificate.pfx");
const filePaths: string = "DllToSign.dll";
tmr.setInput("secureFileId", secureFileId);
tmr.setInput("signCertPassword", signCertPassword);
tmr.setInput("timeServer", timeServer);
tmr.setInput("hashingAlgorithm", hashingAlgorithm);
tmr.setInput("files", filePaths);
tmr.setVariableName("SECURE_FILE_PATH", certificatePath);

let answers: mockanswer.TaskLibAnswers = <mockanswer.TaskLibAnswers>{
    findMatch: {
        "DllToSign.dll": [
            "DllToSign.dll"
        ]
    },
    exec: {}
};
answers.exec[`${signToolPath} sign /fd ${hashingAlgorithm} /t ${timeServer} /f ${certificatePath} /p ${signCertPassword} ${fileToSign}`] = {
    code: 0,
    stdout: `Successfully signed ${fileToSign}`
};

tmr.setAnswers(answers);
tmr.run();
