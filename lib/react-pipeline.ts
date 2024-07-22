import { Stack, StackProps, RemovalPolicy, DefaultStackSynthesizer } from "aws-cdk-lib"
import { Construct } from "constructs"
import { BuildSpec, ComputeType, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, CodeCommitSourceAction, S3DeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import { website_domain, website_bucket_arn, react_repo_arn } from './global_variables';

export class ReactPipelineStack extends Stack {
    constructor(scope: Construct, id: string, stage_Name: string, props?: StackProps) {
        super(scope, id, {
            synthesizer: new DefaultStackSynthesizer(), // Explicitly use the DefaultStackSynthesizer
            ...props,
          });

        const websiteBucket = Bucket.fromBucketArn(this, 'websiteBucket', website_bucket_arn);

        const reactBuildProject = new PipelineProject(this, 'ResumeWebsiteReactBuild', {
            buildSpec: BuildSpec.fromSourceFilename('buildspec.yml'),
            environment: {
                buildImage: LinuxBuildImage.STANDARD_5_0,
                computeType: ComputeType.SMALL
            }
        });

        const artifactBucket = new Bucket(this, 'ResumeReactPipelineArtifactBucket', {
            bucketName: 'resume-react-pipeline-artifact-bucket',
            removalPolicy: RemovalPolicy.DESTROY
        });
        
        const gitOutput = new Artifact('ResumeWebsiteReactBuildLatestMaster');
        
        const buildOutput = new Artifact('ResumeWebsiteReactBuildOutput');

        new Pipeline(this, 'reactPipeline', {
            artifactBucket,
            pipelineName: 'ResumeWebsite-ReactPipeline',
            stages: [
                {
                    stageName: 'source',
                    actions: [
                        new CodeCommitSourceAction({
                            actionName: 'readLatestMasterCommit',
                            output: gitOutput,
                            repository: Repository.fromRepositoryArn(this, 'reactGitRepo', react_repo_arn),
                            branch: 'master'
                        })
                    ]
                },
                {
                    stageName: 'build',
                    actions: [
                        new CodeBuildAction({
                            actionName: 'buildReactApp',
                            input: gitOutput,
                            outputs: [buildOutput],
                            project: reactBuildProject
                        })
                    ]
                },
                {
                    stageName: 'deploy',
                    actions: [
                        new S3DeployAction({
                            actionName: 'DeployReactApp',
                            input: buildOutput,
                            bucket: websiteBucket
                        })
                    ]
                }
            ]
        });

    }
}