import { Stack, StackProps, CfnOutput } from "aws-cdk-lib"
import { Construct } from "constructs"
import { Certificate, CertificateValidation, DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { DefaultStackSynthesizer } from "aws-cdk-lib";
import { website_domain } from './global_variables';

export class CertificateStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZoneWithAttrs', {
            hostedZoneId: "Z03704531OX9ZC1LKTCWX",
            zoneName: website_domain
        })

        const websiteCertificate = new DnsValidatedCertificate(this, 'WebsiteSSL', {
            domainName: website_domain,
            region: 'us-east-1',
            hostedZone
        })
        
        // const websiteCertificate = new D(this, 'WebsiteSSL', {
        //     domainName: 'ecannesson.com',
        //     validation: CertificateValidation.fromDns(hostedZone),
        // });

        const websiteCertArn = websiteCertificate.certificateArn;

        new CfnOutput(this, 'WebsiteCertArn', {
            value: websiteCertArn
        })

      }
}