// Show modal for selecting item type
const showItemTypeBtn = document.getElementById("add-icon");
const selectItemType = document.getElementById("select-item-type");
const overlay = document.getElementById("overlay");
const body = document.body;

// Show the modal when the add-icon is clicked
showItemTypeBtn.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevent click event from bubbling up
  selectItemType.style.display = "flex"; // Show the modal
  body.classList.add("modal-open"); // Blur the background and disable interaction
});

// Hide the modal when clicking outside of it
document.addEventListener("click", (event) => {
  // Check if the click is outside the modal and the add-icon button
  if (
    !selectItemType.contains(event.target) &&
    event.target !== showItemTypeBtn
  ) {
    selectItemType.style.display = "none"; // Hide the modal
    body.classList.remove("modal-open"); // Remove blur and allow interaction again
  }
});

// Hide the modal when an item with the class 'item-type-display' or its children are clicked
selectItemType.addEventListener("click", (event) => {
  let target = event.target;
  
  // Traverse up the DOM tree to check if the clicked element or any of its parents has the 'item-type-display' class
  while (target && target !== selectItemType) {
    if (target.classList.contains("item-type-display")) {
      console.log("Item with 'item-type-display' or its child clicked"); // Debugging log
      selectItemType.style.display = "none"; // Hide the modal
      body.classList.remove("modal-open"); // Remove blur and allow interaction again
      event.stopPropagation(); // Stop click event propagation
      return;
    }
    target = target.parentElement;
  }
});

// Prevent the modal from closing if clicked inside but not on an 'item-type-display'
selectItemType.addEventListener("click", (event) => {
  if (!event.target.classList.contains("item-type-display")) {
    event.stopPropagation(); // Stop click event propagation to avoid triggering the document click listener
  }
});
