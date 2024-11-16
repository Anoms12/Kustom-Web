// Drag-and-drop setup
const displayGeneralOptions = document.getElementById("display-general-options");
let draggedItem = null;

// Function to initialize drag-and-drop for sortable items
function initializeDragAndDrop() {
  document.querySelectorAll(".sortable").forEach((item) => {
    const dragHandle = item.querySelector("#drag-to-sort-icons");

    dragHandle.addEventListener("dragstart", (e) => {
      draggedItem = item;
      draggedItem.classList.add("dragging"); // Add dragging class
      setTimeout(() => {
        item.style.opacity = "0.5"; // Set opacity for visual effect
      }, 0);
      document.body.style.cursor = "grabbing"; // Change cursor on drag start
    });

    dragHandle.addEventListener("dragend", () => {
      draggedItem.classList.remove("dragging"); // Remove dragging class
      setTimeout(() => {
        item.style.opacity = "1"; // Reset opacity after dragging
      }, 0);
      document.body.style.cursor = ""; // Reset cursor style to default
    });

    // Add click event to toggle border on corresponding editor div
    item.addEventListener("click", () => {
      const selectedOption = localStorage.getItem("selectedOption");
      let borderColor = "#000"; // Default color

      switch (selectedOption) {
        case "klwp":
          borderColor = "#ed4852";
          break;
        case "kwgt":
          borderColor = "#47a3fd";
          break;
        case "kwch":
          borderColor = "#72bf72";
          break;
        case "klck":
          borderColor = "#ee8026";
          break;
        case "komp":
          borderColor = "#606060";
          break;
      }

      // Find the corresponding editor div using the internal_title or internal_type
      const internalTitle = item.getAttribute("data-internal-title");
      const editorDiv = document.querySelector(`.item-visual[data-title="${internalTitle}"]`);

      if (editorDiv) {
        // Toggle border
        if (editorDiv.style.border) {
          editorDiv.style.border = "";
        } else {
          editorDiv.style.border = `5px solid ${borderColor}`;
        }
      }
    });
  });
}

// Allow dropping by preventing default behavior
displayGeneralOptions.addEventListener("dragover", (e) => {
  e.preventDefault();
});

// Handle dropping of the item
displayGeneralOptions.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!draggedItem) {
    console.error("No item was dragged.");
    return;
  }

  const items = Array.from(displayGeneralOptions.querySelectorAll(".sortable"));
  const dropY = e.clientY;
  let closestItem = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  items.forEach((item) => {
    if (item !== draggedItem) {
      const itemRect = item.getBoundingClientRect();
      const itemCenterY = itemRect.top + itemRect.height / 2;
      const distance = Math.abs(dropY - itemCenterY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = item;
      }
    }
  });

  if (closestItem) {
    const closestItemRect = closestItem.getBoundingClientRect();
    const closestItemCenterY = closestItemRect.top + closestItemRect.height / 2;

    if (dropY < closestItemCenterY) {
      displayGeneralOptions.insertBefore(draggedItem, closestItem);
    } else {
      displayGeneralOptions.insertBefore(draggedItem, closestItem.nextSibling);
    }
  } else {
    displayGeneralOptions.appendChild(draggedItem);
  }

  // Call updateJsonOrder to ensure data is reordered
  updateJsonOrder();
});

// Function to reorder the JSON based on the UI order
function updateJsonOrder() {
  const sortedItems = Array.from(displayGeneralOptions.children);

  jsonData.preset_root.viewgroup_items = sortedItems.map((item) => {
    const internalType = item.getAttribute("data-internal-type");
    const originalItem = jsonData.preset_root.viewgroup_items.find(
      (obj) => obj.internal_type === internalType
    );
    return originalItem ? { ...originalItem } : {
      internal_type: internalType,
      internal_title: item.querySelector("h1").textContent
    };
  });

  saveJSONToLocal(jsonData);
  console.log("Updated JSON after reordering:", JSON.stringify(jsonData, null, 2));

  // Remove or comment out the following line
  // createItemVisuals();
}

// Function to save the updated JSON data to local storage
function saveJSONToLocal() {
  const jsonDataString = JSON.stringify(jsonData);
  localStorage.setItem("kustomJsonData", jsonDataString); // Adjust the key name if necessary
  console.log("JSON data saved to local storage");
}
