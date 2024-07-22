import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { AllowedMethods, CachePolicy, ViewerProtocolPolicy, CloudFrontWebDistribution, Distribution, HttpVersion, OriginAccessIdentity, PriceClass, ViewerCertificate, SecurityPolicyProtocol, SSLMethod } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import * as path from 'path';
import { HttpsRedirect } from 'aws-cdk-lib/aws-route53-patterns';

export class S3Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, stageName: string, props: cdk.StackProps) {
    super(scope, id, {
      synthesizer: new cdk.DefaultStackSynthesizer(), // Explicitly use the DefaultStackSynthesizer
      ...props,
    });

        const website_domain = "ecannesson.com"

        // S3 Bucket for React website
        const bucket = new Bucket(this, 'websiteBucket' + stageName, {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            bucketName: website_domain + "-" + stageName
        });

        new cdk.CfnOutput(this, 'websiteBucketArn' + stageName, {
            value: bucket.bucketArn
        });
    
    }
}
