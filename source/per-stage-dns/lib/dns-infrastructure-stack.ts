import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';

interface DNSInfrastructureStackProps extends cdk.StackProps {
  stageName: string;
}

export class DNSInfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: DNSInfrastructureStackProps) {
    super(scope, id, props);

    const hostedZone = new route53.PublicHostedZone(this, 'stageHostedZone', {zoneName: this.node.tryGetContext('stageDomainMapping')[props.stageName]});
    if(hostedZone.hostedZoneNameServers){
      new cdk.CfnOutput(this, `NS records`, {
        value: cdk.Fn.join(",", hostedZone.hostedZoneNameServers),
      });
    }
  }
}
