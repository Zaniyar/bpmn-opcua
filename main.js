const { Client, logger } = require('camunda-external-task-client-js');
const OPCX = require('./opcClient');

// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000 };

// create a Client instance with custom configuration
const client = new Client(config);


const opc = new OPCX.OPC();
opc.main();

setTimeout(function(){
  let yellowBlinker = new OPCX.Blinker("Yellow",10);
  yellowBlinker.blinkIt(opc);
},2000)


// susbscribe to the topic: 'charge-card'
client.subscribe('charge-card', async function({ task, taskService }) {
  // Put your business logic here

  // Get a process variable
  const amount = task.variables.get('amount');
  const item = task.variables.get('item');
  const approved = task.variables.get('approved');

  console.log(`Charging credit card with an amount of ${amount}€ for the item '${item}'...approved:${approved}`);

  //open('https://docs.camunda.org/get-started/quick-start/success');
  console.log("FERTIG!")
  // Complete the task
  await taskService.complete(task);
});

client.subscribe('blinkLight', async function({ task, taskService }){
  const color = task.variables.get('color');
  const times = task.variables.get('times');
  let blinker = new OPCX.Blinker(color,times);
  blinker.blinkIt(opc);
  await taskService.complete(task);
})


client.subscribe('switchLight', async function({ task, taskService }){
  const color = task.variables.get('color');
  const isOn = task.variables.get('isOn');
  opc.switchLight(isOn,color);
  console.log(`Switching ${color} Light for ${times} times!`);
  await taskService.complete(task);
})


