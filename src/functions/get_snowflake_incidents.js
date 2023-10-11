const { app } = require('@azure/functions');
const axios = require('axios');
const { EmailClient } = require("@azure/communication-email");
const connectionString = `endpoint=https://snowflake-outages-comm-service.unitedstates.communication.azure.com/;accesskey=69wk1Mo5Z5iYPWy5E9ahgyrufwe7XENPfoxuXV7toEcqA43m6b7E4FGLqWfSrdnxkNwMlsmk2CneM6cUOA6+Zw==`;
const client = new EmailClient(connectionString);
app.http('get_snowflake_incidents', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        let res=""
        try {
            const response =  await axios.get('https://status.snowflake.com/api/v2/incidents.json')
            context.log(`statusCode: ${response.status}`);
            context.log(response.data.page);
           //build the response as HTML 
           res = response.data.page.time_zone;
           updated_at=response.data.page.updated_at; 
           const components = response.data.incidents;
           context.log(components.length);
           var table="<table style=><tr><th>Name</th><th>Status</th><th>Created_at</th><th>Updated_at</th><th>Monitoring_at</th><th>Resolved_at</th><th>Impact</th></tr>"

           components.forEach(function(component) {
            table+=`<tr><td>${component.name}</td><td>${component.status}</td><td>${component.created_at}</td><td>${component.updated_at}</td><td>${component.monitoring_at}</td><td>${component.resolved_at}</td>
            <td>${component.impact}</td>
            </tr>`
        });
        const message = {
          senderAddress: "DoNotReply@b44f4ee9-075c-4277-9905-3755bdbba3e1.azurecomm.net",
          content: {
            subject: "Incidents Report on Snowflake Outages",
            html: `<b>This is a test message</b>"`,
          },
          recipients: {
            to: [
              {
                address: "yoschua_villegas@hakkoda.io",
                displayName: "Yoschua Villegas",
              },
              {
                address: "yeffren@gmail.com",
                displayName: "Yeffren Villegas",
              },
              
            ],
          },
        };
        
        const poller = await client.beginSend(message);
        const email_response = await poller.pollUntilDone();

          } catch (error) {
            // If the promise rejects, an error will be thrown and caught here
            context.error(error);
          }
        return { headers: { 'content-type': 'text/html' },
          style: {'font-family': 'arial, sans-serif',
        },
            body: `<h1 style="color:#00b7f1">Snowflake regions status time zone: ${res}</h1>
            <h2 style="color:#000E4E">Updated at:${updated_at}</h2>
            ${table}
            `};

    }
});
