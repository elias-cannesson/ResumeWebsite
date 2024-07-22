import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Stack imports
import { CertificateStack } from './cert-stack';
import { S3Stack } from './s3-stack';

export class PipelineAppStage extends cdk.Stage {

    constructor(scope: Construct, stageName: string, props?: cdk.StageProps) {
    super(scope, stageName, props);

        const certStack = new CertificateStack(this, 'ResumeWebsiteCertStack', {
            crossRegionReferences: true
        });

        const s3Stack = new S3Stack(this, 'ResumeWebsiteS3Stack', stageName, {
            crossRegionReferences: true
        });

    }
}