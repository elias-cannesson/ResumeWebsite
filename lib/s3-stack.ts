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

import { website_domain, website_cert_arn } from './global_variables';

export class S3Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, stageName: string, props: cdk.StackProps) {
    super(scope, id, {
      synthesizer: new cdk.DefaultStackSynthesizer(), // Explicitly use the DefaultStackSynthesizer
      ...props,
    });

        // S3 Bucket for React website
        const bucket = new Bucket(this, 'websiteBucket' + stageName, {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            bucketName: website_domain + "-" + stageName
        });

        new cdk.CfnOutput(this, 'websiteBucketArn' + stageName, {
            value: bucket.bucketArn
        });

        // Create origin access identity for cloudfront
        const originAccessIdentity = new OriginAccessIdentity(this, 'originAccessIdentity', {
            comment: 'Give cloudfront unrestricted read only access to website bucket'
        })
        bucket.grantRead(originAccessIdentity)

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
                    isDefaultBehavior: true
                }]
            }],
            viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
                aliases: [website_domain],
                securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2021
            })
        })

        // Serve website from Cloudfront domain. Point its domain to the cloudfront domain
        // const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'hostedZoneWithAttrs', {
        //     hostedZoneId: "Z02920461595SR9606W7W",
        //     zoneName: website_domain
        // })
    
    }
}
