import mockanswer = require("azure-pipelines-task-lib/mock-answer");
import tmrm = require("azure-pipelines-task-lib/mock-run");
import path = require("path");
import { IExecSyncResult } from "azure-pipelines-task-lib/toolrunner";
import assert = require("assert");

let taskPath: string = path.join(__dirname, "../task", "index.js");
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

const rootFolder: string = path.normalize("/srcDir");
const secureFileId: string = "THESECUREFILEID";
const signCertPassword: string = "PASSWORD";
const timeServer: string = "http://timestamp.digicert.com";
const hashingAlgorithm: string = "SHA256";
const filePaths: string = "**/*.file\n**/*.file0\n**/*.file2\n**/*.file3\n";

const expectedFiles: string[] = [
    path.normalize("/srcDir/file3.file0"),
    path.normalize("/srcDir/someOtherDir/file1.file"),
    path.normalize("/srcDir/someOtherDir/file2.file2"),
    path.normalize("/srcDir/someOtherDir2/file1.file"),
    path.normalize("/srcDir/someOtherDir2/file2.file3"),
    path.normalize("/srcDir/someOtherDir2/file3.file")
];
const actualFiles: string[] = [];

tmr.setInput("secureFileId", secureFileId);
tmr.setInput("signCertPassword", signCertPassword);
tmr.setInput("timeServer", timeServer);
tmr.setInput("hashingAlgorithm", hashingAlgorithm);
tmr.setInput("filePaths", filePaths);
tmr.setInput("rootFolder", rootFolder);

let answers: mockanswer.TaskLibAnswers = <mockanswer.TaskLibAnswers>{
    checkPath: {},
    find: {},
};
answers.checkPath[path.normalize("/srcDir")] = true;
answers.find[path.normalize("/srcDir")] = [
    path.normalize("/srcDir/file3.file0"),
    path.normalize("/srcDir/someOtherDir"),
    path.normalize("/srcDir/someOtherDir/file1.file"),
    path.normalize("/srcDir/someOtherDir/file2.file2"),
    path.normalize("/srcDir/someOtherDir2"),
    path.normalize("/srcDir/someOtherDir2/file1.file"),
    path.normalize("/srcDir/someOtherDir2/file2.file3"),
    path.normalize("/srcDir/someOtherDir2/file3.file"),
    path.normalize("/srcDir/someOtherDir3"),
];
tmr.setAnswers(answers);
tmr.registerMockExport("stats", (itemPath: string) => {
    switch (itemPath) {
        case path.normalize("/srcDir/someOtherDir"):
        case path.normalize("/srcDir/someOtherDir2"):
        case path.normalize("/srcDir/someOtherDir3"):
            return { isDirectory: () => true };
        case path.normalize("/srcDir/file3.file0"):
        case path.normalize("/srcDir/someOtherDir/file1.file"):
        case path.normalize("/srcDir/someOtherDir/file2.file2"):
        case path.normalize("/srcDir/someOtherDir2/file1.file"):
        case path.normalize("/srcDir/someOtherDir2/file2.file3"):
        case path.normalize("/srcDir/someOtherDir2/file3.file"):
            return { isDirectory: () => false };
        default:
            throw { code: "ENOENT" };
    }
});

tmr.registerMockExport("execSync", (filePath: string, args: string[]): IExecSyncResult => {
    console.log("Filetosign", args[9]);
    actualFiles.push(args[9]);
    assert.equal(actualFiles.indexOf(args[9]), expectedFiles.indexOf(args[9]));
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