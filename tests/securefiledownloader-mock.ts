import tl = require("azure-pipelines-task-lib/task");
import path = require("path");

export class SecureFileDownloader {

    constructor() {
        tl.debug("Mock SecureFileHelpers constructor");
    }

    async downloadSecureFile(secureFileId: string): Promise<string> {
        tl.debug("Mock downloadSecureFile with id = " + secureFileId);
        return path.join(__dirname, "./test-files", "TestCertificate.pfx");
    }

    deleteSecureFile(secureFileId: string): void {
        tl.debug("Mock deleteSecureFile with id = " + secureFileId);
    }
}