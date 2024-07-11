import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib"
import { BuildSpec, ComputeType, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, CodeCommitSourceAction, S3DeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Bucket } from 'aws-cdk-lib/aws-s3';

// Neighbor Stack imports
import { PipelineAppStage } from './stage';


export class ResumeWebsiteStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      synthesizer: new cdk.DefaultStackSynthesizer(), // Explicitly use the DefaultStackSynthesizer
      ...props,
    });

      const pipeline = new CodePipeline(this, 'Pipeline', {
        pipelineName: 'ResumeSitePipeline',
        synth: new ShellStep('Synth', {
          input: CodePipelineSource.gitHub('elias-cannesson/ResumeWebsite', 'main'),
          commands: [
            'npm ci',
            'npm run build',
            'npx cdk synth'
          ]
        })
      });

      const deploymentStage = pipeline.addStage(new PipelineAppStage(this, "deployment", {
        env: {
          account: "654654597644", region: "us-west-2"
        }}
      ));

    }
}