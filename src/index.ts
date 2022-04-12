import { DynamoDB } from 'aws-sdk';
import { APIGatewayEvent, Context } from 'aws-lambda';
import fetch from 'node-fetch';

const client = new DynamoDB.DocumentClient({ region: 'us-east-1' });

export const handler = async (event: APIGatewayEvent, context: Context) => {
    const qFile = await fetchFile();
    const question = await fetchQuestion();
    if (question.length == 1) {
        const response = {
            statusCode: 500,
            body: JSON.stringify('Couldn\'t fetch question'),
        };
        return response;
    }
    
    const response = {
        statusCode: 200,
        body: JSON.stringify('Question successfully fetched'),
    };
    
    return response;

}


const fetchFile = async () => {

    const response = await fetch('https://raw.githubusercontent.com/partyfishgames/trivia/main/trivia.json');
    return response;

}

async function fetchQuestion() {
    const table = 'NewTriviaQs';
    
    const input = {TableName: table};
    var numItems = (await client.scan(input)).Items.length;
    
    var random_index = Math.floor(Math.random()*numItems);
    
    const params = {
        TableName: table,
        KeyConditionExpression: '#q = :qqq',
        ExpressionAttributeNames: {
            '#q': 'qNum'
        },
        ExpressionAttributeValues: {
            ':qqq': random_index
        }
    };

    var question;

    try {
        const data = await client.query(params).promise();
        // const data = await client.query(params).promise()
        console.log('Success');
        console.log(data);
  
        question = [data.Items[0]['qText']['S'], data.Items[0]['ans1']['S'], data.Items[0]['ans2']['S'], data.Items[0]['ans3']['S'], Number(data.Items[0]['correct']['S']) + 1];

        console.log(question);
        return question;

    } catch (err) {
        console.log('Failure: ', err.message);
        return ['None'];
    }
}