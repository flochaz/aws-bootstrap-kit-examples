# Per stage DNS domain deployment pipeline

Assuming you own several domains dedicated to each of your stages (dev-mycompany.com, qa-mycompany.com ...) and you want easily delegate their management to your respective stage account's AWS Route53.

This example is a simple CDK app enabling to create the public hosted zones in each account.


## Usage

### 1. Configure your stage mapping

1. Add your mapping in your cdk.json. For instance:
    ```
    {
    "app": "npx ts-node --prefer-ts-exts bin/per-stage-dns.ts",
    "context": {
        "@aws-cdk/core:enableStackNameDuplicates": "true",
        "aws-cdk:enableDiffNoFail": "true",
        "@aws-cdk/core:stackRelativeExports": "true",
        "@aws-cdk/aws-ecr-assets:dockerIgnoreSupport": true,
        "@aws-cdk/aws-secretsmanager:parseOwnedSecretName": true,
        "@aws-cdk/core:newStyleStackSynthesis": true,
        "@aws-cdk/aws-kms:defaultKeyPolicies": true,
        "@aws-cdk/aws-s3:grantWriteWithoutAcl": true,
        "github_alias": "flochaz",
        "github_repo_name": "aws-bootstrap-kit-examples",
        "github_repo_branch": "main",
        "stageDomainMapping": {
        "dev": "dev-mycompany.com",
        "qa": "staging-mycompany.com",
        "prod": "prod-mycompany.com"
        }
    }
    }
    ```

    `dev`, `qa` and `prod` stageDomainMapping attributes key correspond to the stageName set in `source/1-SDLC-organization/bin/sdlc-organization.ts` .

1. Commit and push your changes
    ```
    git add cdk.json
    git commit -m "configure mapping and github source"
    git push
    ```



### 2. Test it in dev

```
npm ci
npm run build
npm run cdk deploy DevStageDnsStack --  --profile dev
```


### 3. Deploy to stages through pipeline

```
npm run cdk deploy DNSInfrastructurePipelineStack --  --profile mvpv3-cicd
```