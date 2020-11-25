import { BlockPublicAccess, Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  ViewerCertificate
} from '@aws-cdk/aws-cloudfront';
import { Construct, Stack, StackProps, CfnOutput, Tags } from '@aws-cdk/core';
import * as route53 from "@aws-cdk/aws-route53";
import { CloudFrontTarget } from "@aws-cdk/aws-route53-targets";
import * as bootstrapKit from "aws-bootstrap-kit/lib/index.js";
import {
  DnsValidatedCertificate,
  CertificateValidation,
} from "@aws-cdk/aws-certificatemanager";

export class LandingPageStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    Tags.of(this).add('ServiceName', this.node.tryGetContext('service_name'));

    const landingPageBucket = new Bucket(this, 'LandingPageBucket', {
      websiteIndexDocument: 'index.html',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL
    });

    new BucketDeployment(this, 'LandingPageDeployment', {
      sources: [Source.asset('../www')],
      destinationBucket: landingPageBucket,
      retainOnDelete: false
    });

    const landingPageOAI = new OriginAccessIdentity(this, 'LandingPageOAI');


    const rootDomain = "ilovemylocalfarmer.dev";
    const serviceName = "landingpage";
    const stage = 'dev';
    const URL = `${serviceName}.${stage}.${rootDomain}`;

    const delegatedHostedZone = new bootstrapKit.CrossAccountDNSDelegator(this, "subzoneDelegation", {
      zoneName: URL,
    });

    const certificate = new DnsValidatedCertificate(this, "Certificate", {
      hostedZone: delegatedHostedZone.hostedZone,
      domainName: URL,
      region: "us-east-1",
      validation: CertificateValidation.fromDns(delegatedHostedZone.hostedZone),
    });
    certificate._enableCrossEnvironment

    const viewerCertificate = ViewerCertificate.fromAcmCertificate(
      certificate,
      {
        aliases: [URL],
      }
    );

    const landingPageWebDistribution = new CloudFrontWebDistribution(this, 'LandingPageDistribution',
    {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: landingPageBucket,
            originAccessIdentity: landingPageOAI
          },
          behaviors: [
            {
              isDefaultBehavior: true
            }
          ],
        }
      ],
      viewerCertificate: viewerCertificate
    });

    new route53.ARecord(this, "Alias", {
      zone: delegatedHostedZone.hostedZone,
      recordName: URL,
      target: route53.RecordTarget.fromAlias(new CloudFrontTarget(landingPageWebDistribution))
    });

    new CfnOutput(this, 'LandingPageUrl', {
      value: landingPageWebDistribution.distributionDomainName
    });
  }
}
