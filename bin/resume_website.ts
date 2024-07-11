#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ResumeWebsiteStack } from '../lib/cdk-pipeline-stack';

const app = new cdk.App();
new ResumeWebsiteStack(app, 'ResumeWebsiteStack', {
    env: {
      account: '654654597644',
      region: 'us-west-2'
    },
    crossRegionReferences: true
  }
);
app.synth();