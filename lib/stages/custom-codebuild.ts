import { Artifacts, CfnProject, ComputeType } from "aws-cdk-lib/aws-codebuild";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import { Resource } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { CustomProjectPermission } from "./custom-codebuild-permission";
import {
  createBuildSpec,
  createBuildSpec2,
} from "../../config/buildspec-content";

class NoArtifacts extends Artifacts {
  public readonly type = "NO_ARTIFACTS";

  constructor() {
    super({});
  }
}

export class CustomProject extends Resource {
  private readonly appName: string;
  private readonly codebuild: CfnProject;

  constructor(
    scope: Construct,
    id: string,
    props: codebuild.GitHubSourceProps,
    permission: CustomProjectPermission,
    instanceSize?: string,
    cacheBucketName?: string
  ) {
    super(scope, id, {});
    this.appName = this.stack.node.tryGetContext("appName");
    const ciLogPublic = this.stack.node.tryGetContext("ciLogPublic");

    if (!props.webhookFilters) {
      throw new Error("Missing webhooks");
    }

    const artifacts = new NoArtifacts();

    const env: CfnProject.EnvironmentProperty = {
      type: "WINDOWS_SERVER_2019_CONTAINER",
      image: "aws/codebuild/windows-base:2019-2.0",
      imagePullCredentialsType: "CODEBUILD",
      computeType: instanceSize ?? ComputeType.MEDIUM,
      environmentVariables: [
        {
          name: "GIT_LFS_SKIP_SMUDGE",
          type: "PLAINTEXT",
          value: "1",
        },
      ],
    };

    this.codebuild = new CfnProject(this, id + "-Resource", {
      description: "Codebuild",
      visibility: ciLogPublic ? "PUBLIC_READ" : "PRIVATE",
      resourceAccessRole: ciLogPublic
        ? permission.getRole().roleArn
        : undefined,
      source: {
        type: "GITHUB",
        buildSpec: codebuild.BuildSpec.fromObjectToYaml(
          createBuildSpec()
        ).toBuildSpec(),
        location: `https://github.com/${props.owner}/${props.repo}.git`,
        reportBuildStatus: true,
        gitCloneDepth: 1,
      },
      artifacts: artifacts,
      serviceRole: permission.getServiceRole().roleArn,
      cache: {
        type: "S3",
        modes: ["LOCAL_SOURCE_CACHE"],
        location: cacheBucketName,
      },
      environment: env,
    });

    const env2: CfnProject.EnvironmentProperty = {
      type: "LINUX_CONTAINER",
      image: "aws/codebuild/standard:6.0",
      imagePullCredentialsType: "CODEBUILD",
      computeType: ComputeType.SMALL,
      environmentVariables: [
        {
          name: "GIT_LFS_SKIP_SMUDGE",
          type: "PLAINTEXT",
          value: "1",
        },
      ],
    };

    this.codebuild = new CfnProject(this, id + "-Resource2", {
      description: "Codebuild",
      visibility: ciLogPublic ? "PUBLIC_READ" : "PRIVATE",
      resourceAccessRole: ciLogPublic
        ? permission.getRole().roleArn
        : undefined,
      source: {
        type: "GITHUB",
        buildSpec: codebuild.BuildSpec.fromObjectToYaml(
          createBuildSpec2()
        ).toBuildSpec(),
        location: `https://github.com/${props.owner}/${props.repo}.git`,
        reportBuildStatus: true,
        gitCloneDepth: 1,
      },
      artifacts: artifacts,
      serviceRole: permission.getServiceRole().roleArn,
      cache: {
        type: "S3",
        modes: ["LOCAL_SOURCE_CACHE"],
        location: cacheBucketName,
      },
      environment: env2,
    });
  }
}
