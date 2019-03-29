[![Donate](images/donate.png)](https://www.paypal.me/stefankert/5)

[![Build Status](https://dev.azure.com/stefankert/Public/_apis/build/status/StefanKert.azuredevops-codesigning-task?branchName=master)](https://dev.azure.com/stefankert/Public/_build/latest?definitionId=7&branchName=master)

# Code Signing task

Build task for Azure DevOps that gives the user the ability to codesign assemblies and applications.

## Usage

Add a new task, select **Code Signing** from the **Utility** category and configure it as needed.

![Code Signing parameters](images/usage-parameters.png)

Parameters include:

- **Secure File**: The certificate that was uploaded to `Secure Files` to be used to sign the given files. ([Using Secure Files in Azure DevOps](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/secure-files?view=azure-devops&viewFallbackFrom=vsts)).
- **Secure File Password**: The password for the provided certificate. Use a new variable with its lock enabled on the Variables tab to encrypt this value.
- **File(s) to Sign**: Relative path from the repo root to the file(s) you want to sign. You can use wildcards to specify multiple files ([more information](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/file-matching-patterns?view=azure-devops)). For example, **/bin/*.dll for all .DLL files in the 'bin' subfolder.
- **Timestamp Server Url**: Absolute Url of the timestamp server to use.. Default: http://timestamp.digicert.com
- **Hashing Algorithm**: The file digest algorithm to use for creating file signatures (i.e. SHA256 or SHA1). Default: SHA256

## Supported filetypes

The following filetypes are tested and supported:

- .dll, .exe
- .appxbundle
- .appx