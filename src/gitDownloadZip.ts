import * as AWS from 'aws-sdk';
import * as azdev from 'azure-devops-node-api/_build';
import * as fs from 'fs';
import * as GitInterfaces from 'azure-devops-node-api/_build/interfaces/GitInterfaces';
// var ba = require('azure-devops-node-api/BuildApi');
// var bi = require('azure-devops-node-api/interfaces/BuildInterfaces');

import * as stream from 'stream';

const uploadStream = ({ Bucket, Key }: any) => {
  const s3 = new AWS.S3();
  const pass = new stream.PassThrough();
  return {
    writeStream: pass,
    promise: s3.upload({ Bucket, Key, Body: pass }).promise(),
  };
}


// your collection url
let orgUrl: string = '';

let token: string = '';

let authHandler = azdev.getPersonalAccessTokenHandler(token); 
let connection = new azdev.WebApi(orgUrl, authHandler); 

export const handler = async (event: any = {}): Promise<any> => {
    
    // console.log(JSON.stringify(event));
    // console.log('----------------------------------  body  ----------------------------------');
    // console.log(JSON.stringify(JSON.parse(event.body)));

    const body = JSON.parse(event.body);
    const commits: any[] = body.resource.commits;
    const refUpdates: any[] = body.resource.refUpdates;
    const repository: any = body.resource.repository;

    //TODO: not sure that 0 is the newest. add logic to confirm newest commit
    const branch: string = refUpdates[0].name;
    const newObjectId: string = refUpdates[0].newObjectId;
    const commitId:string = commits[0].commitId;
    // const repositoryId:string = repository.id;

	console.log('stuff');
    let gitApiObject = await connection.getGitApi();
    let project = 'TrinityIndustriesCodePipelineExample';



    const commit: GitInterfaces.GitCommit = await gitApiObject.getCommit(commitId, repository.id);
    console.log('----------------------------------  commit  ----------------------------------');
    console.log(JSON.stringify(commit,null,2));
    // const treeId = commit.treeId;

    // const branches = await gitApiObject.getBranches(
    //     // repositoryId: string,
    //     // project?: string,
    // console.log('----------------------------------  branches  ----------------------------------');
    // console.log(JSON.stringify(branches,null,2));


    // const refs = await gitApiObject.getRefs(
    //     // repositoryId: string,
    //     // project?: string,
    // console.log('----------------------------------  refs  ----------------------------------');
    // console.log(JSON.stringify(refs,null,2));

        // repositoryId: string,
        // sha1: string,
        // project?: string,
        // projectId?: string,
        // recursive?: boolean,
        // fileName?: string

	const { writeStream, promise } = uploadStream({Bucket: 'bkl-lambda-test', Key: 'mystuff.zip'});
    const readStream: NodeJS.ReadableStream = await gitApiObject.getTreeZip(
        repository.id,
        <string>commit.treeId,
        repository.project.name,
        repository.project.id,
        true);

	const output = await readStream.pipe(writeStream);
	const stuff = await promise.then(console.log);

	console.log('done');
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};


        // repositoryId: string,
        // project?: string,
        // scopePath?: string,
        // recursionLevel?: GitInterfaces.VersionControlRecursionType,
