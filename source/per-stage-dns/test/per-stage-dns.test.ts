import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as PerStageDns from '../lib/dns-infrastructure-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new PerStageDns.DNSInfrastructureStack(app, 'MyTestStack', {stageName: 'test'});
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
