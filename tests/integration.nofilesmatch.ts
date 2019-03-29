import mockanswer = require("azure-pipelines-task-lib/mock-answer");
import tmrm = require("azure-pipelines-task-lib/mock-run");
import path = require("path");

let taskPath: string = path.join(__dirname, "../task", "index.js");
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);
tmr.setInput("secureFileId", "SECUREFILEID");
tmr.setInput("signCertPassword", "PASSWORD");
tmr.setInput("timeServer", "http://timestamp.digicert.com");
tmr.setInput("hashingAlgorithm", "SHA256");
tmr.setInput("filePaths", "**/*.dll");
tmr.setInput("rootFolder", path.join(__dirname, "rootFolder"));

let answers: mockanswer.TaskLibAnswers = <mockanswer.TaskLibAnswers>{
    find: {},
    checkPath: {},
};
answers.checkPath[path.normalize(path.join(__dirname, "rootFolder"))] = true;
answers.find[path.normalize(path.join(__dirname, "rootFolder"))] = [
    path.normalize("/hierarchy"),
    path.normalize("/hierarchy/folder1"),
    path.normalize("/hierarchy/folder1/file1.file"),
    path.normalize("/hierarchy/folder1/file2.file"),
    path.normalize("/hierarchy/folder1/folder1.1/file1.file"),
    path.normalize("/hierarchy/folder1/folder1.1/file2.file"),
    path.normalize("/hierarchy/folder1/folder1.2/file1.file"),
    path.normalize("/hierarchy/folder1/folder1.2/file2.file"),
    path.normalize("/hierarchy/folder2"),
    path.normalize("/hierarchy/folder2/file1.file"),
    path.normalize("/hierarchy/folder2/file2.file"),
    path.normalize("/hierarchy/folder2/file3.file"),
    path.normalize("/hierarchy/folder3"),
];

tmr.setAnswers(answers);
tmr.run();