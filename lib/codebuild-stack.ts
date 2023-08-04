import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import { CustomProject } from "./stages/custom-codebuild";
import { CacheBucket } from "./stages/cache-bucket";
import { CustomProjectPermission } from "./stages/custom-codebuild-permission";

export class CodeBuildStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const appName = this.node.tryGetContext("appName");
    const costTagValue = this.node.tryGetContext("costTagValue");

    const cache = new CacheBucket(this);
    const cacheLayer = cache.getCacheLayer();

    const permission = new CustomProjectPermission(this, `${appName}-ci-perm`);

    const ciPush = this.node.tryGetContext("ciPush");
    if (ciPush) {
      const gitHubSourcePush: codebuild.GitHubSourceProps = {
        owner: this.node.tryGetContext("owner"),
        repo: this.node.tryGetContext("repo"),
        webhook: true,
        buildStatusContext: "buildspec-win.yml",
        webhookFilters: [
          codebuild.FilterGroup.inEventOf(
            codebuild.EventAction.PUSH
          ).andHeadRefIs(this.node.tryGetContext("branch")),
        ],
      };

      new CustomProject(
        this,
        `${appName}-push`,
        gitHubSourcePush,
        permission,
        codebuild.ComputeType.MEDIUM,
        cacheLayer.bucketName
      );
    }
  }
}
