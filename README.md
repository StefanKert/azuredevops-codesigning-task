[![Donate](images/donate.png)](https://www.paypal.me/stefankert/5)

# Code Signing task
Build task for VS Team Services that gives the user the ability to codesign assemblies and applications.

## Usage
Add a new task, select **Code Signing** from the **Utility** category and configure it as needed.

![Code Signing parameters](images/usage-parameters.png)

Parameters include:
- **Secure File**: Select the certificate from your secure file store in VSTS ([Using Secure Files in VSTS](https://docs.microsoft.com/en-us/vsts/build-release/concepts/library/secure-files?view=vsts)) .
- **Secure File Password**: The certificate password. It is recommended to use a build variable here.
- **File to Sign**: The .dll or the .exe that contains your code and needs to be signed.