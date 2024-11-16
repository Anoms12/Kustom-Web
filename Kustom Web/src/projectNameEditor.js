const projectName = document.querySelector(".project-name");

// Function to update the project name
function updateName(input) {
  const newProjectName = document.createElement("h1");
  newProjectName.className = "project-name";
  newProjectName.innerText = input.value || "Untitled"; // Ensure fallback name

  // Replace the input with the new <h1>
  input.parentNode.replaceChild(newProjectName, input);

  // Update the preset title in jsonData
  updatePresetTitle(input);

  // Reattach the double-click event listener to the new <h1>
  attachDoubleClick(newProjectName);
}

// Function to set the project name from preset_info
function setProjectNameFromPresetInfo() {
  if (jsonData && jsonData.preset_info && jsonData.preset_info.title) {
    const projectNameElement = document.querySelector(".project-name");
    if (projectNameElement) {
      projectNameElement.innerText = jsonData.preset_info.title;
      console.log("Project name set to:", jsonData.preset_info.title);
    } else {
      console.error("Project name element not found.");
    }
  } else {
    console.error("jsonData or preset_info.title is not defined.");
  }
}

// Call this when DOM is loaded to attach double click event and set project name
document.addEventListener("DOMContentLoaded", () => {
  const projectName = document.querySelector(".project-name");
  if (projectName) attachDoubleClick(projectName);

  // Set the project name from preset_info
  setProjectNameFromPresetInfo();
});

// Function to handle double-click event
function attachDoubleClick(element) {
  element.addEventListener("dblclick", function () {
    // Create an input element
    const input = document.createElement("input");
    input.type = "text";
    input.value = element.innerText; // Set the input value to current text
    input.className = "project-input";

    // Replace the <h1> with the input
    element.parentNode.replaceChild(input, element);
    input.focus();

    // Handle the input blur event
    input.addEventListener("blur", function () {
      updateName(input);
    });

    // Handle the Enter key press
    input.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        updateName(input);
      }
    });
  });
}

// Attach the double-click event listener to the initial <h1>
attachDoubleClick(projectName);

function updatePresetTitle(input) {
  if (jsonData && jsonData.preset_info) {
    jsonData.preset_info.title = input.value || "Untitled"; // Update title in jsonData
    console.log("Updated preset title:", jsonData.preset_info.title);
  } else {
    console.error("jsonData or preset_info is not defined.");
  }
}
