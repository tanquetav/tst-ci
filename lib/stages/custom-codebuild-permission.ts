import { Artifacts, CfnProject, ComputeType } from "aws-cdk-lib/aws-codebuild";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import { Resource } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { CacheBucket } from "./cache-bucket";

export class CustomProjectPermission extends Resource {
  private readonly appName: string;
  private readonly role: iam.IRole;
  private readonly serviceRole: iam.IRole;

  constructor(scope: Construct, id: string) {
    super(scope, id, {});

    this.appName = this.stack.node.tryGetContext("appName");
    const ciLogPublic = this.stack.node.tryGetContext("ciLogPublic");

    this.serviceRole = new iam.Role(this.stack, `${this.appName}-sr-id`, {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      description: "Codebuild permission",
    });

    // 👇 Create a Managed Policy and associate it with the role
    const managedServicePolicy = new iam.ManagedPolicy(
      this.stack,
      `${this.appName}-managed-sr-id`,
      {
        description: "CodeBuildGetLogsPermission",
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents",
            ],
            resources: [
              "arn:aws:logs:" +
                cdk.Stack.of(this).region +
                ":" +
                cdk.Stack.of(this).account +
                ":log-group:/aws/*",
              "arn:aws:logs:" +
                cdk.Stack.of(this).region +
                ":" +
                cdk.Stack.of(this).account +
                ":log-group:/aws/*:*",
            ],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "codebuild:BatchPutCodeCoverages",
              "codebuild:BatchPutTestCases",
              "codebuild:CreateReport",
              "codebuild:CreateReportGroup",
              "codebuild:UpdateReport",
            ],
            resources: [
              "arn:aws:codebuild:" +
                cdk.Stack.of(this).region +
                ":" +
                cdk.Stack.of(this).account +
                ":report-group/*",
            ],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "s3:PutObject",
              "s3:GetObject",
              "s3:List*",
              "s3:GetObjectVersion",
              "s3:GetBucketAcl",
              "s3:GetBucketLocation",
            ],
            resources: [
              "arn:aws:s3:::" + this.stack.stackName.toLocaleLowerCase() + "*",
            ],
          }),

          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["secretsmanager:GetSecretValue"],
            resources: ["*"],
          }),
        ],
        roles: [this.serviceRole],
      }
    );
    if (ciLogPublic) {
      this.role = new iam.Role(this.stack, `${this.appName}-iam-role-id`, {
        assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
        description: "Codebuild permission",
      });

      // 👇 Create a Managed Policy and associate it with the role
      const managedPolicy = new iam.ManagedPolicy(
        this.stack,
        `${this.appName}-managed-policy-id`,
        {
          description: "CodeBuildGetLogsPermission",
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["logs:GetLogEvents"],
              resources: ["*"],
            }),
          ],
          roles: [this.role],
        }
      );
    }
  }

  getServiceRole(): iam.IRole {
    return this.serviceRole;
  }

  getRole(): iam.IRole {
    return this.role;
  }
}
