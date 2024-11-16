let undoStack = [];
let redoStack = [];

// Initialize jsonData globally from localStorage to avoid "undefined" errors
let jsonData = loadJSONFromLocal();

// Ensure jsonData has the correct structure
if (!jsonData.preset_root) {
  jsonData.preset_root = {};
}

// Ensure viewgroup_items is the last property in preset_root
if (!jsonData.preset_root.viewgroup_items) {
  jsonData.preset_root.viewgroup_items = [];
}

// Get selected option from localStorage for file extension and other configurations
const selectedOption = localStorage.getItem("selectedOption");
if (!selectedOption) {
  console.error("No selected option found in localStorage.");
} else {
  console.log("Selected option:", selectedOption);
  // Continue with using selectedOption
}

// Use selected option as the color preset for the editor
if (selectedOption === "klwp") {
  // Leave value the same for klwp color
} else if (selectedOption === "kwgt") {
  document.documentElement.style.setProperty("--Kustom-color", "#47a3fd");
  document.getElementById("animated-image-display").style.display = "none";
} else if (selectedOption === "kwch") {
  document.documentElement.style.setProperty("--Kustom-color", "#72bf72");
} else if (selectedOption === "klck") {
  document.documentElement.style.setProperty("--Kustom-color", "#ee8026");
} else if (selectedOption === "komp") {
  document.documentElement.style.setProperty("--Kustom-color", "#606060");
}

// Function to save the JSON to a file
function saveJSONToFile(jsonData) {
  const dataStr = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "preset.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Function to load JSON from local storage
function loadJSONFromLocal() {
  const jsonString = localStorage.getItem("presetData");
  if (!jsonString) {
    console.warn("No JSON data found in local storage.");
    return { preset_root: { viewgroup_items: [] } }; // Default structure
  }

  try {
    const data = JSON.parse(jsonString);
    // Ensure the structure is correct
    if (!data.preset_root) {
      data.preset_root = {};
    }
    if (!data.preset_root.viewgroup_items) {
      data.preset_root.viewgroup_items = [];
    }
    return data;
  } catch (e) {
    console.error("Failed to parse JSON from local storage:", e);
    return { preset_root: { viewgroup_items: [] } }; // Default structure
  }
}

// event listener for exporting JSON file
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("export-json-btn").addEventListener("click", () => {
    exportProject();
  });
});

function exportProject() {
  const projectNameElement = document.querySelector("h1.project-name");

  if (!projectNameElement) {
    console.error(
      "Project name element not found. Ensure you have an h1 with class 'project-name'."
    );
    return;
  }

  const projectName =
    projectNameElement.textContent.trim() || "default_project"; // Fallback if empty
  const selectedOption = localStorage.getItem("selectedOption");

  if (!selectedOption) {
    console.error(
      "Selected option is undefined. Make sure 'selectedOption' is set in localStorage."
    );
    return;
  }

  const element = document.getElementById("editor-container");
  if (element) {
    html2canvas(element).then((canvas) => {
      const imageBlob = dataURItoBlob(canvas.toDataURL("image/jpeg", 0.9));
      saveFilesAndZip(projectName, imageBlob, selectedOption);
    });
  } else {
    console.error(
      "Editor container not found. Ensure the element exists with id 'editor-container'."
    );
  }
}

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const buffer = new ArrayBuffer(byteString.length);
  const dataArray = new Uint8Array(buffer);

  for (let i = 0; i < byteString.length; i++) {
    dataArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([buffer], { type: mimeString });
}

function saveFilesAndZip(projectName, imageBlob, selectedOption) {
  const zip = new JSZip();

  // Use the in-memory jsonData, which is already updated
  const formattedJSON = JSON.stringify(jsonData, null, 2);

  // Add the JSON file to the ZIP
  zip.file(`preset.json`, formattedJSON);

  zip.file(`preview.jpg`, imageBlob);

  zip.folder(`fonts`);
  zip.folder(`icons`);

  zip.generateAsync({ type: "blob" }).then(function (content) {
    const zipName = `${projectName}.${selectedOption}`;
    const blob = new Blob([content], { type: "application/zip" });
    saveAs(blob, zipName);
    showTerminalLog(projectName, zipName);
  });
}

// Log the created files in the terminal (simulation of terminal output)
function showTerminalLog(projectName, zipName) {
  console.log(`Project folder: ${projectName}`);
  console.log(`Created files within the root folder:`);
  console.log(`- preset.json`);
  console.log(`- preview.jpg`);
  console.log(`- fonts (empty folder)`);
  console.log(`- icons (empty folder)`);
  console.log(`Exported as: ${zipName}`);
}

// Event listener for loading JSON data on page load
document.addEventListener("DOMContentLoaded", () => {});

// Show main content after everything is loaded
window.onload = () => {
  document.getElementById("loading-screen").style.display = "none"; // Hide loading screen
  document.getElementById("body").style.display = "flex"; // Show main content
};

function initializeEditorContainer() {
  const container = document.getElementById("editor-container");
  if (!container) {
    console.error("Editor container not found");
    return;
  }

  // Ensure jsonData and its structure exist
  if (!jsonData || !jsonData.preset_info) {
    console.error("Invalid JSON data structure");
    return;
  }

  // Set the width and height of the editor container
  const { width, height } = jsonData.preset_info;
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;

  console.log(`Editor container set to width: ${width}px, height: ${height}px`);
}

// Call this function to initialize the editor container dimensions
initializeEditorContainer();

// Set project type to zipname
const projectType = document.getElementById("project-type");
projectType.textContent = selectedOption.toUpperCase();

function createGeneralOption(
  type,
  iconHref,
  optionName,
  optionDescription = "",
  addToJsonData = true,
  saveToJson = true
) {
  const selectItemType = document.getElementById("select-item-type");

  // Create the new general-options div
  const generalOptionsDiv = document.createElement("div");
  generalOptionsDiv.classList.add("sortable");
  generalOptionsDiv.id = "general-options"; // Set the correct ID
  generalOptionsDiv.setAttribute("data-internal-type", type); // Set the internal type

  // Create drag-to-sort-icons div
  const dragToSortIconsDiv = document.createElement("div");
  dragToSortIconsDiv.id = "drag-to-sort-icons";
  dragToSortIconsDiv.classList.add("draggable");
  dragToSortIconsDiv.setAttribute("draggable", "true");
  dragToSortIconsDiv.innerHTML = `
  <svg class="general-options-icons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
    <path d="M14.25 7.5C14.25 8.29565 13.9339 9.05871 13.3713 9.62132C12.8087 10.1839 12.0456 10.5 11.25 10.5C10.4544 10.5 9.69129 10.1839 9.12868 9.62132C8.56607 9.05871 8.25 8.29565 8.25 7.5C8.25 6.70435 8.56607 5.94129 9.12868 5.37868C9.69129 4.81607 10.4544 4.5 11.25 4.5C12.0456 4.5 12.8087 4.81607 13.3713 5.37868C13.9339 5.94129 14.25 6.70435 14.25 7.5ZM11.25 21C12.0456 21 12.8087 20.6839 13.3713 20.1213C13.9339 19.5587 14.25 18.7956 14.25 18C14.25 17.2044 13.9339 16.4413 13.3713 15.8787C12.8087 15.3161 12.0456 15 11.25 15C10.4544 15 9.69129 15.3161 9.12868 15.8787C8.56607 16.4413 8.25 17.2044 8.25 18C8.25 18.7956 8.56607 19.5587 9.12868 20.1213C9.69129 20.6839 10.4544 21 11.25 21ZM11.25 31.5C12.0456 31.5 12.8087 31.1839 13.3713 30.6213C13.9339 30.0587 14.25 29.2956 14.25 28.5C14.25 27.7044 13.9339 26.9413 13.3713 26.3787C12.8087 25.8161 12.0456 25.5 11.25 25.5C10.4544 25.5 9.69129 25.8161 9.12868 26.3787C8.56607 26.9413 8.25 27.7044 8.25 28.5C8.25 29.2956 8.56607 30.0587 9.12868 30.6213C9.69129 31.1839 10.4544 31.5 11.25 31.5ZM27.75 7.5C27.75 8.29565 27.4339 9.05871 26.8713 9.62132C26.3087 10.1839 25.5456 10.5 24.75 10.5C23.9544 10.5 23.1913 10.1839 22.6287 9.62132C22.0661 9.05871 21.75 8.29565 21.75 7.5C21.75 6.70435 22.0661 5.94129 22.6287 5.37868C23.1913 4.81607 23.9544 4.5 24.75 4.5C25.5456 4.5 26.3087 4.81607 26.8713 5.37868C27.4339 5.94129 27.75 6.70435 27.75 7.5ZM24.75 21C25.5456 21 26.3087 20.6839 26.8713 20.1213C27.4339 19.5587 27.75 18.7956 27.75 18C27.75 17.2044 27.4339 16.4413 26.8713 15.8787C26.3087 15.3161 25.5456 15 24.75 15C23.9544 15 23.1913 15.3161 22.6287 15.8787C22.0661 16.4413 21.75 17.2044 21.75 18C21.75 18.7956 22.0661 19.5587 22.6287 20.1213C23.1913 20.6839 23.9544 21 24.75 21ZM24.75 31.5C25.5456 31.5 26.3087 31.1839 26.8713 30.6213C27.4339 30.0587 27.75 29.2956 27.75 28.5C27.75 27.7044 27.4339 26.9413 26.8713 26.3787C26.3087 25.8161 25.5456 25.5 24.75 25.5C23.9544 25.5 23.1913 25.8161 22.6287 26.3787C22.0661 26.9413 21.75 27.7044 21.75 28.5C21.75 29.2956 22.0661 30.0587 22.6287 30.6213C23.1913 31.1839 23.9544 31.5 24.75 31.5Z"/>
  </svg>`;

  // Create icon-for-option-type div
  const iconForOptionTypeDiv = document.createElement("div");
  iconForOptionTypeDiv.id = "icon-for-option-type";
  iconForOptionTypeDiv.innerHTML = `
    <svg class="icon">
      <use href="${iconHref}"></use>
    </svg>`;

  // Create option name and description div
  const optionNameDesc = document.createElement("div");
  optionNameDesc.id = "option-name-description";
  optionNameDesc.innerHTML = `
    <h1 id="main-option-name">${optionName}</h1>
    <h2 id="main-option-description">${optionDescription}</h2>`; // Description remains in HTML

  // Create selected icon div
  const selectedIconDiv = document.createElement("div");
  selectedIconDiv.id = "selected-icon";
  selectedIconDiv.innerHTML = `
    <svg class="icon">
      <use href="icons.svg#icon-selected-no"></use>
    </svg>`;

  // Append all components to the new general-options div
  generalOptionsDiv.appendChild(dragToSortIconsDiv);
  generalOptionsDiv.appendChild(iconForOptionTypeDiv);
  generalOptionsDiv.appendChild(optionNameDesc);
  generalOptionsDiv.appendChild(selectedIconDiv);

  // Append to the displayGeneralOptions container
  const displayGeneralOptions = document.getElementById(
    "display-general-options"
  );
  displayGeneralOptions.appendChild(generalOptionsDiv);

  // Re-initialize drag-and-drop functionality for the newly added items
  initializeDragAndDrop();

  // Attach double-click event to the new option name for editing
  optionNameDesc.querySelector("h1").addEventListener("dblclick", editItemName);

  // Add click event listener to the selected icon div
  selectedIconDiv.addEventListener("click", function () {
    const icon = selectedIconDiv.querySelector("use");
    const currentHref = icon.getAttribute("href");

    // Toggle selected icon
    if (currentHref === "icons.svg#icon-selected-no") {
      icon.setAttribute("href", "icons.svg#icon-selected-yes");
      // Show the selected-options container
      document.getElementById("selected-options").style.display = "block";
      console.log("Icon changed to selected-yes, showing selected-options.");
    } else {
      icon.setAttribute("href", "icons.svg#icon-selected-no");
      // Hide the selected-options container
      document.getElementById("selected-options").style.display = "none";
      console.log("Icon changed to selected-no, hiding selected-options.");
    }
  });

  // Ensure delete-icon is always visible when selected-icon is yes
  const deleteIcon = document.getElementById("delete-icon");
  if (deleteIcon) {
    deleteIcon.style.display = "block";
    console.log("Ensuring delete-icon is always visible.");

    // Add click event listener to the delete icon
    deleteIcon.addEventListener("click", function () {
      // Find all selected general-options
      const selectedIcons = document.querySelectorAll(
        "#selected-icon use[href='icons.svg#icon-selected-yes']"
      );
      selectedIcons.forEach((icon) => {
        // Find the corresponding general-options div
        const generalOptionDiv = icon.closest(".sortable");

        if (generalOptionDiv) {
          // Get the index of this general-options div relative to its siblings
          const generalOptionsContainer = document.getElementById(
            "display-general-options"
          );
          const generalOptionIndex = Array.from(
            generalOptionsContainer.children
          ).indexOf(generalOptionDiv);

          // Remove the general-options div from the DOM
          generalOptionDiv.remove();

          // Remove the corresponding JSON data based on index
          removeFromJsonDataByIndex(generalOptionIndex);
        }
      });

      // Hide the selected-options container after deletion
      document.getElementById("selected-options").style.display = "none";
      console.log("Selected options hidden after deletion.");
    });
  } else {
    console.error("delete-icon element not found.");
  }

  // Check if the new option should be added to jsonData.preset_root.viewgroup_items
  if (addToJsonData && saveToJson) {
    jsonData.preset_root.viewgroup_items.push({
      internal_type: type,
      internal_title: optionName,
      // Description is not added to JSON
    });

    console.log("New option created:", {
      internal_type: type,
      internal_title: optionName,
    });
  }
}

// Usage for different types
document.getElementById("komponent-display").addEventListener("click", () => {
  createGeneralOption(
    "KomponentModule",
    "icons.svg#icon-komponent",
    "Komponent",
    ""
  );
});

document.getElementById("text-display").addEventListener("click", () => {
  createGeneralOption(
    "TextModule",
    "icons.svg#icon-text",
    "Text",
    "(time formula)"
  );
});

document.getElementById("shape-display").addEventListener("click", () => {
  createGeneralOption("ShapeModule", "icons.svg#icon-shape", "Shape", "Square");
});

document.getElementById("image-display").addEventListener("click", () => {
  createGeneralOption(
    "BitmapModule",
    "icons.svg#icon-image",
    "Image",
    "Image (# x #)"
  );
});

document.getElementById("fonticon-display").addEventListener("click", () => {
  createGeneralOption(
    "FontIconModule",
    "icons.svg#icon-fonticon",
    "Fonticon",
    "Icon-pack => icon-name"
  );
});

document.getElementById("progress-display").addEventListener("click", () => {
  createGeneralOption(
    "ProgressModule",
    "icons.svg#icon-progress",
    "Progress",
    "Type(style, Flat Progress)"
  );
});

document
  .getElementById("morphing-text-display")
  .addEventListener("click", () => {
    createGeneralOption(
      "CurvedTextModule",
      "icons.svg#icon-morphing-text",
      "Morphing Text",
      "(time formula)"
    );
  });

document.getElementById("series-display").addEventListener("click", () => {
  createGeneralOption(
    "SeriesModule",
    "icons.svg#icon-series",
    "Series",
    "(type (# to #)(style))"
  );
});

document
  .getElementById("overlap-group-display")
  .addEventListener("click", () => {
    createGeneralOption(
      "OverlapLayerModule",
      "icons.svg#icon-overlap-group",
      "Overlap Group",
      "(contents)"
    );
  });

document.getElementById("stack-group-display").addEventListener("click", () => {
  createGeneralOption(
    "StackLayerModule",
    "icons.svg#icon-stack-group",
    "Stack Group",
    "(contents)"
  );
});

document
  .getElementById("animated-image-display")
  .addEventListener("click", () => {
    createGeneralOption(
      "MovieModule",
      "icons.svg#icon-animated-image",
      "Animated Image",
      "movie (# x #)"
    );
  });

// Call loadPresetData to initialize options
loadPresetData();

// Function to log jsonData as a string
function logJsonData() {
  console.log(JSON.stringify(jsonData, null, 2));
}

// Assign the function to a global variable for easy access in the console
window.json = logJsonData;

// Function to remove the corresponding item in the JSON based on index
function removeFromJsonDataByIndex(index) {
  if (
    jsonData &&
    jsonData.preset_root &&
    jsonData.preset_root.viewgroup_items
  ) {
    // Check if the index is valid
    if (index >= 0 && index < jsonData.preset_root.viewgroup_items.length) {
      // Remove the item from jsonData at the specified index
      jsonData.preset_root.viewgroup_items.splice(index, 1);

      // Save the updated jsonData to local storage
      saveJSONToLocal(jsonData);
      console.log(
        "Updated JSON Data after deletion:",
        JSON.stringify(jsonData, null, 2)
      );
    }
  }
}

// Function to save the current state to the undo stack
function saveState() {
  undoStack.push(JSON.stringify(jsonData));
  redoStack = []; // Clear redo stack whenever a new action is taken
}

// Function to undo the last action
function undo() {
  if (undoStack.length > 0) {
    redoStack.push(JSON.stringify(jsonData));
    jsonData = JSON.parse(undoStack.pop());
    saveJSONToLocal(jsonData);
    console.log("Undo performed. Current JSON:", jsonData);
    // Optionally, refresh the UI to reflect changes
  } else {
    console.log("No actions to undo.");
  }
}

// Function to redo the last undone action
function redo() {
  if (redoStack.length > 0) {
    undoStack.push(JSON.stringify(jsonData));
    jsonData = JSON.parse(redoStack.pop());
    saveJSONToLocal(jsonData);
    console.log("Redo performed. Current JSON:", jsonData);
    // Optionally, refresh the UI to reflect changes
  } else {
    console.log("No actions to redo.");
  }
}

// Attach event listeners to the undo and redo buttons
document.getElementById("undo-icon").addEventListener("click", undo);
document.getElementById("redo-icon").addEventListener("click", redo);

// Call saveState() before any action that modifies jsonData
