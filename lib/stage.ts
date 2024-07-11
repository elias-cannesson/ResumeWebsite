import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Stack imports
import { CertificateStack } from './cert-stack'

export class PipelineAppStage extends cdk.Stage {

    constructor(scope: Construct, stageName: string, props?: cdk.StageProps) {
    super(scope, stageName, props);

        const certStack = new CertificateStack(this, 'ResumeWebsiteCertStack', {
            crossRegionReferences: true
        });

    }
}