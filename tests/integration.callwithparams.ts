import mockanswer = require("azure-pipelines-task-lib/mock-answer");
import tmrm = require("azure-pipelines-task-lib/mock-run");
import path = require("path");
import { IExecSyncResult } from "azure-pipelines-task-lib/toolrunner";
import assert = require("assert");

let taskPath: string = path.join(__dirname, "../task", "index.js");
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

const rootFolder: string = path.join("tests");
const secureFileId: string = "THESECUREFILEID";
const signCertPassword: string = "PASSWORD";
const timeServer: string = "http://timestamp.digicert.com";
const hashingAlgorithm: string = "SHA256";
const filePaths: string = "DllToSign.dll";
const signToolPath: string = path.normalize(path.join(__dirname, "../task", "signtool.exe"));
const fileToSign: string = "DllToSign.dll";
const certificatePath: string = path.join(__dirname, "./test-files", "TestCertificate.pfx");

tmr.setInput("secureFileId", secureFileId);
tmr.setInput("signCertPassword", signCertPassword);
tmr.setInput("timeServer", timeServer);
tmr.setInput("hashingAlgorithm", hashingAlgorithm);
tmr.setInput("filePaths", filePaths);
tmr.setInput("rootFolder", rootFolder);

let answers: mockanswer.TaskLibAnswers = <mockanswer.TaskLibAnswers>{
    find: {},
    checkPath: {}
};
answers.checkPath[path.normalize(rootFolder)] = true;
answers.find[rootFolder] = [
    path.normalize(path.join(rootFolder, fileToSign))
];

tmr.setAnswers(answers);
tmr.registerMockExport("stats", (itemPath: string): any => {
    switch (itemPath) {
        case path.normalize(path.join(rootFolder, fileToSign)):
            return { isDirectory: () => false };
        default:
            throw { code: "ENOENT" };
    }
});

tmr.registerMockExport("execSync", (filePath: string, args: string[]): IExecSyncResult => {
    console.log(filePath);
    console.log(args);
    assert.equal(filePath, signToolPath);
    assert.equal(args[0], "sign");
    assert.equal(args[1], "/fd");
    assert.equal(args[2], hashingAlgorithm);
    assert.equal(args[3], "/t");
    assert.equal(args[4], timeServer);
    assert.equal(args[5], "/f");
    assert.equal(args[6], certificatePath);
    assert.equal(args[7], "/p");
    assert.equal(args[8], signCertPassword);
    assert.equal(args[9], path.normalize(path.join(rootFolder, fileToSign)));

    return {
        error: null,
        stdout: "Finished stuff",
        stderr: null,
        code: 0
    };
});

const sec: NodeRequire = require("./securefiledownloader-mock");
tmr.registerMock("./securefiledownloader", sec);
tmr.run();