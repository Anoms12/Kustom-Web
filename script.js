let jsonData = {}; // This will hold the JSON data

function loadJsonFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0]; // Get the selected file

  if (!file) {
    alert("Please select a JSON file.");
    return;
  }

  const reader = new FileReader(); // Create a FileReader object

  reader.onload = function (event) {
    try {
      jsonData = JSON.parse(event.target.result); // Parse the JSON data
      displayPreset(); // Call the function to display the data
    } catch (error) {
      alert("Error reading JSON file: " + error.message);
    }
  };

  reader.readAsText(file); // Read the file as text
}

// Function to display the parsed JSON data
function displayPreset() {
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = ""; // Clear previous output

  // Iterate through the keys in jsonData
  for (const key in jsonData) {
    if (jsonData.hasOwnProperty(key)) {
      // Create the <h1> for each key (like preset_info)
      let presetInfoHtml = `<h1>${replaceUnderscores(key)}</h1>`;
      const presetObject = jsonData[key]; // Get the object associated with this key

      // Call the recursive function to display the object
      presetInfoHtml += displayObject(presetObject, 2); // Start with <h2> for internal items

      // Append to the outputDiv
      outputDiv.innerHTML += presetInfoHtml;
    }
  }
}

// Recursive function to display objects and their attributes
function displayObject(obj, headingLevel) {
  let html = "";

  // Check if the object is an array
  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      html += displayObject(item, headingLevel); // Display each item directly
    });
  } else if (typeof obj === "object" && obj !== null) {
    for (const attrKey in obj) {
      if (obj.hasOwnProperty(attrKey)) {
        const displayKey = replaceUnderscores(attrKey); // Replace underscores for display

        // Check if this attribute is the internal_type
        if (attrKey === "internal_type") {
          html += `<h2 style="font-size: 24px;">${displayKey}</h2>`; // Larger font for internal type
          html += `<div style="margin-left: 20px;">`; // Use div for spacing instead of ul
        } else if (attrKey === "viewgroup_items") {
          // Directly display the viewgroup items without bullet points
          html += `<h3 style="font-size: 22px;">Viewgroup Items:</h3>`;
          for (const item of obj[attrKey]) {
            html += `<div style="margin-left: 20px;">${displayObject(item, headingLevel + 1)}</div>`; // Adjust as necessary for the inner content
          }
        } else if (attrKey === "internal_toggles" || attrKey === "internal_formulas") {
          html += `<li><strong style="font-size: 20px;">${displayKey}</strong>: <ul style="font-size: 18px;">`; // Adjust sizes for toggles and formulas

          // Display toggles and formulas together for clarity
          for (const toggleKey in obj[attrKey]) {
            if (obj[attrKey].hasOwnProperty(toggleKey)) {
              const value = obj[attrKey][toggleKey]; // Get the toggle value
              const formulaValue = obj.internal_formulas?.[toggleKey] || "N/A"; // Use N/A if no formula exists
              html += `<li><h4 style="font-size: 18px;">${replaceUnderscores(toggleKey)}:</h4> <span style="font-size: 18px;">${value} (Formula: ${formulaValue})</span></li>`;
            }
          }
          html += `</ul></li>`;
        } else {
          // If the attribute is an object, display it recursively
          if (typeof obj[attrKey] === "object") {
            html += `<li><strong style="font-size: 20px;">${displayKey}</strong>: ${displayObject(obj[attrKey], headingLevel + 1)}</li>`;
          } else {
            // Format each attribute and value
            html += `<li style="font-size: 16px;">${displayKey}: <span style="font-size: 18px;">${obj[attrKey]}</span></li>`;
          }
        }
      }
    }
    html += `</div>`; // Close the <div> after processing all attributes
  } else {
    // Handle primitive types (string, number, etc.)
    html += `${obj}`;
  }

  return html;
}


// Function to replace underscores with spaces
function replaceUnderscores(str) {
    return str.replace(/_/g, ' '); // Replace all underscores with spaces
  }