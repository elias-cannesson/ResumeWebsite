import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { CloudFrontWebDistribution, OriginAccessIdentity, PriceClass, ViewerCertificate, SecurityPolicyProtocol, SSLMethod, ViewerProtocolPolicy, CfnFunction, FunctionEventType } from 'aws-cdk-lib/aws-cloudfront';
import { HttpsRedirect } from 'aws-cdk-lib/aws-route53-patterns';
// import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
// import * as path from 'path';


import { website_domain, website_cert_arn, hosted_zone_id } from './global_variables';

export class S3Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, stageName: string, props: cdk.StackProps) {
    super(scope, id, {
      synthesizer: new cdk.DefaultStackSynthesizer({}), // Explicitly use the DefaultStackSynthesizer
      ...props,
    });

        // S3 Bucket for React website
        const bucket = new Bucket(this, 'websiteBucket' + stageName, {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            bucketName: 'www.' + website_domain
        });

        new cdk.CfnOutput(this, 'websiteBucketArn' + stageName, {
            value: bucket.bucketArn
        });

        // Create origin access identity for cloudfront
        const originAccessIdentity = new OriginAccessIdentity(this, 'originAccessIdentity', {
            comment: 'Give cloudfront unrestricted read only access to website bucket'
        });
        bucket.grantRead(originAccessIdentity);

        new cdk.CfnOutput(this, "originAccessID", {
            value: originAccessIdentity.originAccessIdentityId
        });

        // set up domain and certificate and distribution
        const certificate = Certificate.fromCertificateArn(this, 'ResumeWebsiteCertificate', website_cert_arn);

        const distribution = new CloudFrontWebDistribution(this, 'cloudfrontWebDistribution-' + stageName, {
            priceClass: PriceClass.PRICE_CLASS_ALL,
            originConfigs: [{
                s3OriginSource: {
                    s3BucketSource: bucket,
                    originAccessIdentity
                },
                behaviors: [{
                    isDefaultBehavior: true,
                    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    maxTtl: cdk.Duration.seconds(20)
                }]
            }],
            viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
                aliases: [website_domain, 'wwww.' + website_domain],
                securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2021, // default
                sslMethod: SSLMethod.SNI
            })
        });

        // Serve website from Cloudfront domain. Point its domain to the cloudfront domain
        const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZoneWithAttrs', {
            hostedZoneId: hosted_zone_id,
            zoneName: website_domain
        });

        new ARecord(this, 'aliasForCloudfront', {
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
            zone: hostedZone,
            recordName: website_domain
        });

        // another new ARecord
        new ARecord(this, 'aliasForCloudfront2', {
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
            zone: hostedZone,
            recordName: "www." + website_domain
        });


        const repo = new Repository(this, 'ResumeWebsiteSource', {
            repositoryName: 'resume-website-git-repo',
            description: `React repo for ${website_domain}`
        });

        new cdk.CfnOutput(this, 'reactRepoArn' + "-" + stageName, {
            value: repo.repositoryArn
        });
    
    }
}
