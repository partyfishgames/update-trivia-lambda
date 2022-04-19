import { DynamoDB } from 'aws-sdk';
import { APIGatewayEvent, Context } from 'aws-lambda';
import axios from 'axios';

// const client = new DynamoDB.DocumentClient({ region: 'us-east-1' });

const fetchFile = async () => {

    const response = await axios.get('https://raw.githubusercontent.com/partyfishgames/trivia/main/trivia.json');
    const json = response.data;
    return json

}

export const handler = async () => { //(event: APIGatewayEvent, context: Context) => {
    const qFile = await fetchFile();
    console.log(qFile[0]);
    
    // const question = await fetchQuestion();
    // if (question.length == 1) {
    //     const response = {
    //         statusCode: 500,
    //         body: JSON.stringify('Couldn\'t fetch question'),
    //     };
    //     return response;
    // }
    
    // const response = {
    //     statusCode: 200,
    //     body: JSON.stringify('Question successfully fetched'),
    // };
    
    // return response;

}


async function fetchQuestion(client: DynamoDB.DocumentClient) {
    const table = 'NewTriviaQs';
    
    const input = {TableName: table};
    var response = await client.scan(input).promise();

    if (!response.Items || response.Items.length == 0) {
        return ['None']
    }

    var numItems = response.Items.length;
    
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
        if (!data.Items) {
            throw Error('Invalid response data');
        }
        console.log('Success');
        console.log(data);
  
        question = [data.Items[0]['qText']['S'], data.Items[0]['ans1']['S'], data.Items[0]['ans2']['S'], data.Items[0]['ans3']['S'], Number(data.Items[0]['correct']['S']) + 1];

        console.log(question);
        return question;

    } catch (err) {
        console.log('Failure: ', err);
        return ['None'];
    }
}