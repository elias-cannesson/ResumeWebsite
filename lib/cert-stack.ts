import { Stack, StackProps, CfnOutput } from "aws-cdk-lib"
import { Construct } from "constructs"
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { DefaultStackSynthesizer } from "aws-cdk-lib";
import { website_domain } from './global_variables';

export class CertificateStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZoneWithAttrs', {
            hostedZoneId: "Z02920461595SR9606W7W",
            zoneName: website_domain
        })
    

      }
}