import mockanswer = require("azure-pipelines-task-lib/mock-answer");
import tmrm = require("azure-pipelines-task-lib/mock-run");
import path = require("path");

let taskPath: string = path.join(__dirname, "../task", "codesigning.js");
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);
tmr.setInput("secureFileId", "SECUREFILEID");
tmr.setInput("signCertPassword", "PASSWORD");
tmr.setInput("timeServer", "http://timestamp.digicert.com");
tmr.setInput("hashingAlgorithm", "SHA256");
tmr.setInput("files", "**/*.dll");

let answers: mockanswer.TaskLibAnswers = <mockanswer.TaskLibAnswers>{
    findMatch: {
        "**/*.dll": []
    }
};

tmr.setAnswers(answers);
tmr.run();