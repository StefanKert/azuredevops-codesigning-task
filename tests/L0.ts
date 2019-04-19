import * as path from "path";
import * as assert from "assert";
import * as ttm from "azure-pipelines-task-lib/mock-test";
import * as exec from "child_process";

describe("CodeSigning Azure DevOps Extension", function (): void {
    this.timeout(20000);

    it("Should call signtool with configured parameters", (done: MochaDone) => {
        let tp: string = path.join(__dirname, "L0CodeSigningSingleFile.js");
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.invokedToolCount, 1);
        assert.equal(tr.succeeded, true, "should have succeeded");
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 0, "should have no errors");

        done();
    });

    it("Should fail if configured custom signtool path is not existent", (done: MochaDone) => {
        let tp: string = path.join(__dirname, "L0CodeSigningShouldFailWithNonExistingCustomSignToolPath.js");
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.invokedToolCount, 0);
        assert.equal(tr.succeeded, false, "should have succeeded");
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 1, "should have no errors");
        assert.equal(tr.errorIssues[0], `There is no signtool available at ${path.normalize(path.join(__dirname, "customSignToolPath", "signtool.exe"))}`);
        done();
    });

    it("Should fail if configured custom signtool path doesn´t match signtool.exe", (done: MochaDone) => {
        let tp: string = path.join(__dirname, "L0CodeSigningShouldFailWithCustomSignToolPathDifferentThanSignToolExe.js");
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.invokedToolCount, 0);
        assert.equal(tr.succeeded, false, "should have succeeded");
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 1, "should have no errors");

        assert.equal(tr.errorIssues[0], `The path ${path.join(__dirname, "./test-files", "TestCertificate.pfx")} is invalid. Please use only valid files (signtool.exe).`);

        done();
    });

    it("Should call signtool with configured parameters and custom signtoolpath", (done: MochaDone) => {
        let tp: string = path.join(__dirname, "L0CodeSigningWithCustomSignToolPath.js");
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.invokedToolCount, 1);
        assert.equal(tr.succeeded, true, "should have succeeded");
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 0, "should have no errors");

        done();
    });

    it("Should call signtool with configured parameters and latest installed signtool", (done: MochaDone) => {
        let tp: string = path.join(__dirname, "L0CodeSigningWithLatestVersionInstalled.js");
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        console.log(tr.stdout);

        assert.equal(tr.invokedToolCount, 1);
        assert.equal(tr.succeeded, true, "should have succeeded");
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 0, "should have no errors");

        done();
    });

    it("Should call signtool for all files that match pattern", (done: MochaDone) => {
        let tp: string = path.join(__dirname, "L0CodeSigningMultipleFiles.js");
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.invokedToolCount, 6);
        assert.equal(tr.succeeded, true, "should have succeeded");
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 0, "should have no errors");

        done();
    });

    it("If no files in root folder match given filter task should fail", (done: MochaDone) => {
        let tp: string = path.join(__dirname, "L0CodeSigningNoMatchingFileInput.js");
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.invokedToolCount, 0);
        assert.equal(tr.succeeded, false, "should have failed");
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 1, "should have errors");

        done();
    });

    it("Should succeed signing AppBundles", (done: MochaDone) => {
        const signTool: string = path.join(__dirname, "../task/signtool.exe");
        const msixFile: string = path.join(__dirname, "test-files", "appbundle", "App.appxbundle");
        const certFile: string = path.join(__dirname, "test-files", "AppCertificate.pfx");
        const signCertPassword: string = "";

        exec.execFile(signTool,
            ["sign", "/fd", "SHA256", "/t", "http://timestamp.digicert.com", "/f", certFile, "/p", signCertPassword, msixFile],
            (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
                done();
            });
    });

    it("Should succeed signing AppBundles2", (done: MochaDone) => {
        const signTool: string = path.join(__dirname, "../task/signtool.exe");
        const msixFile: string = path.join(__dirname, "test-files", "appbundle", "App2.appxbundle");
        const certFile: string = path.join(__dirname, "test-files", "AppCertificate2.pfx");
        const signCertPassword: string = "12345";

        exec.execFile(signTool,
            ["sign", "/fd", "SHA256", "/t", "http://timestamp.digicert.com", "/f", certFile, "/p", signCertPassword, msixFile],
            (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
                done();
            });
    });

    it("Should succeed signing Msixbundle", (done: MochaDone) => {
        const signTool: string = path.join(__dirname, "../task/signtool.exe");
        const msixFile: string = path.join(__dirname, "test-files", "msixbundle", "App.msixbundle");
        const certFile: string = path.join(__dirname, "test-files", "AppCertificate2.pfx");
        const signCertPassword: string = "12345";

        exec.execFile(signTool,
            ["sign", "/fd", "SHA256", "/t", "http://timestamp.digicert.com", "/f", certFile, "/p", signCertPassword, msixFile],
            (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
                done();
            });
    });

    it("Should succeed signing AppPackage", (done: MochaDone) => {
        const signTool: string = path.join(__dirname, "../task/signtool.exe");
        const msixFile: string = path.join(__dirname, "test-files", "apppackage", "App.appx");
        const certFile: string = path.join(__dirname, "test-files", "AppCertificate.pfx");
        const signCertPassword: string = "";

        exec.execFile(signTool,
            ["sign", "/fd", "SHA256", "/t", "http://timestamp.digicert.com", "/f", certFile, "/p", signCertPassword, msixFile],
            (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
                done();
            });
    });

    it("Should succeed signing MSI", (done: MochaDone) => {
        const signTool: string = path.join(__dirname, "../task/signtool.exe");
        const msixFile: string = path.join(__dirname, "test-files", "msi", "App.msi");
        const certFile: string = path.join(__dirname, "test-files", "AppCertificate.pfx");
        const signCertPassword: string = "";

        exec.execFile(signTool,
            ["sign", "/fd", "SHA256", "/t", "http://timestamp.digicert.com", "/f", certFile, "/p", signCertPassword, msixFile],
            (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
                done();
            });
    });

    it("Should succeed signing Exe", (done: MochaDone) => {
        const signTool: string = path.join(__dirname, "../task/signtool.exe");
        const msixFile: string = path.join(__dirname, "test-files", "exe", "App.exe");
        const certFile: string = path.join(__dirname, "test-files", "AppCertificate.pfx");
        const signCertPassword: string = "";

        exec.execFile(signTool,
            ["sign", "/fd", "SHA256", "/t", "http://timestamp.digicert.com", "/f", certFile, "/p", signCertPassword, msixFile],
            (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
                done();
            });
    });

    it("Should succeed signing DLL", (done: MochaDone) => {
        const signTool: string = path.join(__dirname, "../task/signtool.exe");
        const msixFile: string = path.join(__dirname, "test-files", "dll", "App.dll");
        const certFile: string = path.join(__dirname, "test-files", "AppCertificate.pfx");
        const signCertPassword: string = "";

        exec.execFile(signTool,
            ["sign", "/fd", "SHA256", "/t", "http://timestamp.digicert.com", "/f", certFile, "/p", signCertPassword, msixFile],
            (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
                done();
            });
    });
});