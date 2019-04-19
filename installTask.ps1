param(
    [string] $organizationUrl,
    [string] $pat,
    [string] $artifactPath
)

npm install -g tfx-cli@0.6.3

tfx login -u $organizationUrl -t $pat
tfx build tasks upload --task-path $artifactPath