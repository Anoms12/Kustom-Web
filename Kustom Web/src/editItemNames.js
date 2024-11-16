// Double tap to edit item name
const editItemName = (event) => {
  const mainOptionName = event.currentTarget;
  const currentText = mainOptionName.textContent;

  // Create an input element
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentText;
  input.className = "editable"; // Optional: apply styles
  input.style.width = "100%"; // Adjust width to fit the parent

  // Replace the h1 with the input field
  const parentElement = mainOptionName.parentElement;
  parentElement.replaceChild(input, mainOptionName);

  // Focus on the input field
  input.focus();

  // On blur, replace input with updated h1
  input.addEventListener("blur", () => {
    const newText = input.value.trim() || currentText; // Fall back to current text if empty
    const h1 = document.createElement("h1");
    h1.id = "main-option-name"; // Restore the id
    h1.textContent = newText;

    // Reattach the double-click event to the new h1
    h1.addEventListener("dblclick", editItemName);
    parentElement.replaceChild(h1, input);

    // Get the index of the edited item in the DOM
    const generalOptionsContainer = document.getElementById("display-general-options");
    const generalOptionDiv = parentElement.parentElement; // Get the direct parent of the edited item
    const generalOptionIndex = Array.from(generalOptionsContainer.children).indexOf(generalOptionDiv); // Get index of the general options div

    // Log the index for debugging
    console.log("Editing item at index:", generalOptionIndex);
    console.log("Old Title:", currentText);
    console.log("New Title:", newText);

    // Update the option name in jsonData using the index
    if (jsonData && jsonData.preset_root && jsonData.preset_root.viewgroup_items) {
      const itemToUpdate = jsonData.preset_root.viewgroup_items[generalOptionIndex];

      // Log the item being updated
      console.log("Updating item:", itemToUpdate);

      if (itemToUpdate) {
        // Ensure we are updating the right item
        if (itemToUpdate.internal_type === parentElement.parentElement.getAttribute("data-internal-type") && itemToUpdate.internal_title === currentText) {
          itemToUpdate.internal_title = newText; // Update the name in JSON data
          saveJSONToLocal(jsonData); // Save the updated JSON data

          // Log the updated JSON for verification
          console.log("Updated JSON Data after edit:", JSON.stringify(jsonData, null, 2));
        } else {
          console.log("Item types or titles do not match, no update performed.");
        }
      } else {
        console.log("Item not found in JSON data.");
      }
    }
  });

  // Handle 'Enter' key to confirm the edit
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      input.blur(); // Trigger the blur event
    }
  });
};

// Attach the double-click event to the title on load
document.addEventListener("DOMContentLoaded", () => {
  const mainOptionName = document.getElementById("main-option-name");
  if (mainOptionName) {
    mainOptionName.addEventListener("dblclick", editItemName);
  }
});