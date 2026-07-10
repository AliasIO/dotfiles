# GitHub Actions AWS Roles

`github-actions-deploy-roles.yml` is the canonical template for the `GitHubActionsOidc` CloudFormation stack in AWS account `799414939380`.

It creates the GitHub OIDC provider and two short-lived deployment roles:

- `ISO100GitHubDeploy`, trusted only by the `AliasIO/iso100` `production` environment.
- `AliasIoGitHubDeploy`, trusted only by the `AliasIO/alias.io` `production` environment.

The repository variables named `AWS_DEPLOY_ROLE_ARN` point each manual `Deploy` workflow at its project role. The roles may assume the existing CDK bootstrap roles in `us-east-1`; they do not use stored GitHub access keys.

Update the stack through CloudFormation with `CAPABILITY_NAMED_IAM`. Never replace the repository/environment subject conditions with organization-wide wildcards.
