import { Duration, Stack } from "aws-cdk-lib";
import { Cache } from "aws-cdk-lib/aws-codebuild";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class CacheBucket {
  private readonly stack: Construct;
  private readonly appName: string;

  constructor(stack: Construct) {
    this.stack = stack;
    this.appName = this.stack.node.tryGetContext("appName");
  }

  getCacheLayer(): Bucket {
    return new Bucket(this.stack, `${this.appName}-Cache`, {
      lifecycleRules: [
        {
          enabled: true,
          expiration: Duration.days(7),
        },
      ],
    });
  }
}
