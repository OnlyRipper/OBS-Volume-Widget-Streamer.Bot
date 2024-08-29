const ADDRESS = "127.0.0.1"; // IP of SB instance
const PORT = "8080"; // Port of SB instance
const ENDPOINT = "/"; // Endpoint of SB instance
const WEBSOCKET_URI = `ws://${ADDRESS}:${PORT}${ENDPOINT}`;
const EVENT_LISTENER_NAMEID = "Stars"; // Custom event listener ID

const ws = new WebSocket(WEBSOCKET_URI);

// Global variables to store arguments
//let actionName = "{Websocket} Main Trigger";
let actionName = "{VOLUME]  Get sources volumes";
let trigger = "";
let subActionName = "Execute Code (GetVolumes)";
let parentName = "{Websocket} Main Trigger";

function setupWebSocket() {
  console.log("Attempting to connect to Streamer.bot...");

  ws.addEventListener("open", (event) => {	
	  console.log("Connected to Streamer.bot");
    // Subscribing to listen for all Actions triggered inside SB
	  ws.send(
	    JSON.stringify({
		  request: "Subscribe",
		  id: EVENT_LISTENER_NAMEID,
		  events: {
		    Raw: ["Action", "SubAction"]
		  }
	    })
	  );
	});

  ws.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.addEventListener("close", (event) => {
    console.log("WebSocket connection closed:", event);
  });
}

function handleWebSocketMessages() {
  ws.addEventListener("message", (event) => {
    if (!event.data) return;

    let jsonData;
    try {
      jsonData = JSON.parse(event.data);
      //console.log("Received JSON data:", jsonData); // Log the full JSON data for debugging
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return;
    }

    // Check if the data object exists
    if (!jsonData.data) {
      console.error("jsonData.data is undefined. Full jsonData:", jsonData);
      return;
    }

    const actionType = jsonData.event.type; // Action or SubAction
    //console.log("Action Type:", actionType);

    // Ensure that argumentsData exists
    const argumentsData = jsonData.data.arguments;
    if (!argumentsData) {
      console.error("argumentsData is undefined. jsonData.data:", jsonData.data);
      return;
    }

    // Check for volumes in SubAction or Action
    if ((actionType === "SubAction" || actionType === "Action") && argumentsData.volumes) {
      const volumes = argumentsData.volumes;
      console.log("Volumes received:", volumes);
      displayVolumes(volumes); // Process and display the volumes
    } else {
      //console.error(`No volumes found in ${actionType}. jsonData.data:`, jsonData.data);
    }
  });
}


function displayVolumes(volumes) {
  // Function to display volumes on the UI
  console.log("Displaying volumes:", volumes);
}


// JavaScript function to display the volume list
function displayVolumes(volumes) {
  const volumeList = document.getElementById('volumeList');
  volumeList.innerHTML = ""; // Clear the list before adding new elements

  volumes.forEach(volume => {
    // Split the string to extract the label and the decibel value
    const [label, value] = volume.split(': ');
    const dbValue = parseFloat(value);

    const visualValue = dbToPercentage(dbValue);

    // Create the list item and volume bar
    const listItem = document.createElement('li');
    const volumeBar = document.createElement('div');
    volumeBar.className = 'volume-bar';

    const volumeLevel = document.createElement('div');
    volumeLevel.className = 'volume-level';
    volumeLevel.style.width = `${visualValue}%`;
    volumeLevel.innerText = `${visualValue}%`;

    // Append the label and the volume bar to the list item
    listItem.innerText = `${label}: `;
    volumeBar.appendChild(volumeLevel);
    listItem.appendChild(volumeBar);

    // Append the list item to the volume list
    volumeList.appendChild(listItem);
  });

  function dbToPercentage(dbValue) {
    const minDb = -30;
    const maxDb = 0;
  
    // Ensure dbValue is within the bounds
    dbValue = Math.min(Math.max(dbValue, minDb), maxDb);
  
    // Convert the dbValue to a percentage (0 to 100)
    const percentage = ((dbValue - minDb) / (maxDb - minDb)) * 100;
  
    return Math.round(percentage); // Rounds to the nearest whole number
  }      
      }
      
      setupWebSocket();
      handleWebSocketMessages();