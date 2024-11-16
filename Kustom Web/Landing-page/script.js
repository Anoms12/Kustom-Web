
// Function to handle Kustom file upload (remains the same)
document.getElementById("kustom-file-upload").addEventListener("change", async function (event) {
  const file = event.target.files[0]; // Get the uploaded file

  if (file) {
      try {
          const zip = new JSZip();
          const fileData = await file.arrayBuffer();
          const loadedZip = await JSZip.loadAsync(fileData);
          const jsonFile = Object.keys(loadedZip.files).find((filename) => filename.endsWith(".json"));

          if (jsonFile) {
              const jsonContent = await loadedZip.file(jsonFile).async("text");

              // Store the JSON content in localStorage
              localStorage.setItem("presetData", jsonContent);

              // Get the file extension
              const fileExtension = file.name.split('.').pop();

              // Save the file extension to localStorage
              localStorage.setItem("fileExtension", fileExtension);

              // Set selectedOption to file extension and save to localStorage
              localStorage.setItem("selectedOption", fileExtension);

              console.log(`File extension (${fileExtension}) saved as selectedOption.`);

              // Redirect to the editor page
              window.location.href = "../Editor/index.html";
          } else {
              alert("No .json file found in the uploaded archive.");
          }
      } catch (error) {
          console.error("Error processing file:", error);
      }
  }
});


// Show dropdown on button click
document.getElementById("create-kustom-file-btn").addEventListener("click", function (event) {
  const dropdown = document.getElementById("dropdown");
  dropdown.classList.toggle("hidden");
  event.stopPropagation();
});

// Handle dropdown item selection and save to localStorage
document.getElementById("dropdown").addEventListener("click", function (event) {
  const selectedOption = event.target.closest("[data-option]");

  if (selectedOption) {
      const selectedValue = selectedOption.getAttribute("data-option");

      // Save selected option to localStorage
      localStorage.setItem("selectedOption", selectedValue);

      // Create a new empty JSON object structure
      const emptyJson = {
          preset_info: {
              version: 1,
              title: "New Project",
              description: "",
              author: "",
              email: "",
              width: null,
              height: null,
              features: "",
              release: "377428214",
              locked: false,
              pflags: null,
          },
          preset_root: {
              internal_events: [],
          },
      };

      // Save the empty JSON to localStorage
      localStorage.setItem("presetData", JSON.stringify(emptyJson));

      console.log(`Selected option (${selectedValue}) and new JSON saved to localStorage.`);

      // Redirect to the editor page
      window.location.href = "../Editor/index.html";
  }
});

// Hide dropdown when clicking outside of it
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("dropdown");
  const button = document.getElementById("create-kustom-file-btn");

  if (!dropdown.contains(event.target) && !button.contains(event.target)) {
      dropdown.classList.add("hidden");
  }
});

// Hide the loading screen when the window has loaded
window.onload = () => {
  const loadingScreen = document.getElementById("loading-screen");
  const mainContent = document.getElementById("main-content");

  loadingScreen.style.display = "none"; // Hide loading screen
  mainContent.style.display = "block"; // Show main content
};
