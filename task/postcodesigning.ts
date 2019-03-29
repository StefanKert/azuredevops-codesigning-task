import * as fs from "fs";
import * as path from "path";
import * as tl from "azure-pipelines-task-lib/task";

async function run(): Promise<void> {
    try {
        tl.setResourcePath(path.join(__dirname, "task.json"));
        const secureFile: string = tl.getTaskVariable("SECURE_FILE_PATH");
        if (secureFile && tl.exist(secureFile)) {
            fs.unlinkSync(secureFile);
            tl.debug("Deleted secure file downloaded from the server: " + secureFile);
        }
    } catch (err) {
        tl.warning(tl.loc("DeleteSecureFileFailed", err));
    }
}

run();