// Declare pickr and currentItemIndex at a higher scope
let pickr;
let currentItemIndex = null;

document.addEventListener("DOMContentLoaded", function () {
  const colorPickerContainer = document.getElementById("color-picker-container");

  if (!colorPickerContainer) {
    console.error("Color picker container not found");
    return;
  }

  // Initialize Pickr
  pickr = Pickr.create({
    el: colorPickerContainer,
    theme: "classic",
    default: "#FFFFFFFF", // or use item.paint_color if available
    components: {
      preview: true,
      opacity: true,
      hue: true,
      interaction: {
        hex: true,
        rgba: false,
        input: true,
        save: true,
      },
    },
  });

  // Listen for color changes
  pickr.on('change', (color, instance) => {
    const hexColor = color.toHEXA().toString();
    console.debug("Color changed:", hexColor);

    // Update the displayed hex value
    const hexValueElement = document.getElementById("hex-value");
    if (hexValueElement) {
      hexValueElement.textContent = hexColor.toUpperCase();
    }

    // Update the Pickr button color
    const pickrButton = document.querySelector(".pcr-button");
    if (pickrButton) {
      pickrButton.style.setProperty('--pcr-color', hexColor);
    }

    // Update the paint_color value in the data model
    if (currentItemIndex !== null) {
      const item = jsonData.preset_root.viewgroup_items[currentItemIndex];
      if (item) {
        item.paint_color = hexColor;
        console.debug(`Updated paint_color for item at index ${currentItemIndex}: ${item.paint_color}`);
      }
    }
  });

  // Ensure pickr is initialized before setting up event listeners
  if (!pickr) {
    console.error("Pickr initialization failed");
    return;
  }

  // Add event listeners for showing the color picker
  const hexValueElement = document.getElementById("hex-value");
  if (hexValueElement) {
    hexValueElement.addEventListener("click", function (event) {
      console.debug("Hex value clicked, showing color picker");

      const pickrElement = document.querySelector('.pcr-app');

      if (pickrElement) {
        // Set the position of the Pickr instance under the cursor
        pickrElement.style.position = 'absolute';
        pickrElement.style.left = `${event.clientX}px`;
        pickrElement.style.top = `${event.clientY}px`;
      }

      pickr.show();
    });
  }

  const pickrButton = document.querySelector(".pcr-button");
  if (pickrButton) {
    pickrButton.addEventListener("click", function () {
      console.debug("Pickr button clicked, showing color picker");
      pickr.show();
    });
  }

  // Set up event listeners for sortable items
  document.querySelectorAll(".sortable").forEach((option, index) => {
    option.addEventListener("click", () => {
      console.debug(`Sortable item clicked: index ${index}`);
      currentItemIndex = index; // Store the current item index
      displayAttributes(index);
    });
  });
});

// Define a configuration object for attributes with tab and options information
const attributeConfig = {
  shape_type: {
    label: "Shape",
    defaultValue: "Square",
    type: "option-select",
    tab: "shape",
    options: [
      { name: "Square", value: "" },
      { name: "Circle", value: "CIRCLE" },
      { name: "Rectangle", value: "RECT" },
      { name: "Oval", value: "OVAL" },
      { name: "Triangle", value: "TRIANGLE" },
      { name: "Right Triangle", value: "RTRIANGLE" },
      { name: "Hexagon", value: "EXAGON" },
      { name: "Circle Slice", value: "SLICE" },
      { name: "Arc", value: "ARC" },
      { name: "Squircle", value: "SQUIRCLE" },
      { name: "Path", value: "PATH" },
    ],
  },
  shape_width: {
    label: "Width",
    defaultValue: 20,
    min: 1,
    max: 100,
    type: "value-toggle",
    tab: "shape",
  },
  shape_height: {
    label: "Height",
    defaultValue: 20,
    min: 1,
    max: 100,
    type: "value-toggle",
    tab: "shape",
  },
  paint_color: {
    label: "Color",
    defaultValue: "#FFFFFFFF",
    type: "option-hex",
    tab: "paint",
  },
  // Add more attributes as needed
};

// Function to initialize attributes with default values
function initializeAttributes(item) {
  Object.keys(attributeConfig).forEach((key) => {
    if (!item.hasOwnProperty(key)) {
      item[key] = attributeConfig[key].defaultValue;
      console.debug(`Initialized ${key} with default value: ${item[key]}`);
    }
  });
}

// Function to create an attribute display based on type
function createAttributeDisplay(attr, item, pickr, typePrefix) {
  const attributeDiv = document.createElement("div");
  attributeDiv.className = "item-attribute";
  attributeDiv.id = attr.id;

  switch (attr.key) {
    case "shape_type":
      attributeDiv.innerHTML = `
        <svg class="icon" id="attribute-icon"><use href="icons.svg#icon-text"></use></svg>
        <h1 id="attribute-name">${attr.label}</h1>
        <h1 class="attribute-value" style="cursor: pointer;">${getShapeTypeDisplayName(item.shape_type)}</h1>
        <svg class="icon" id="select-attribute-selected-icon"><use href="icons.svg#icon-selected-no"></use></svg>
      `;
      addShapeTypeClickListener(attributeDiv, item, attr.label);
      break;
    case "shape_width":
    case "shape_height":
      attributeDiv.innerHTML = `
        <svg class="icon" id="attribute-icon"><use href="icons.svg#icon-text"></use></svg>
        <h1 id="attribute-name">${attr.label}</h1>
        <div id="down-buttons">
          <svg class="icon" id="subtract-twenty"><use href="icons.svg#icon-skip"></use></svg>
          <svg class="icon" id="subtract-one"><use href="icons.svg#icon-minus"></use></svg>
        </div>
        <h1 class="attribute-value">${item[attr.key]}</h1>
        <div id="up-buttons">
          <svg class="icon" id="add-one"><use href="icons.svg#icon-add"></use></svg>
          <svg class="icon" id="add-twenty"><use href="icons.svg#icon-skip"></use></svg>
        </div>
        <svg class="icon" id="select-attribute-selected-icon"><use href="icons.svg#icon-selected-no"></use></svg>
      `;
      addValueToggleListeners(attributeDiv, item, attr.key, typePrefix);
      break;
    case "paint_color":
      attributeDiv.innerHTML = `
        <svg class="icon" id="attribute-icon"><use href="icons.svg#icon-text"></use></svg>
        <h1 id="attribute-name">Color</h1>
        <h1 id="hex-value" class="attribute-value" style="cursor: pointer">${item[attr.key]}</h1>
        <div class="pickr">
          <button type="button" class="pcr-button" role="button" aria-label="toggle color picker dialog" style="--pcr-color: ${item[attr.key]};"></button>
        </div>
        <svg class="icon" id="select-attribute-selected-icon"><use href="icons.svg#icon-selected-no"></use></svg>
      `;
      addColorPickerListeners(attributeDiv, pickr, item);
      break;
    default:
      attributeDiv.innerHTML = `
        <svg class="icon" id="attribute-icon"><use href="icons.svg#icon-text"></use></svg>
        <h1 id="attribute-name">${attr.label}</h1>
        <h1 class="attribute-value">${item[attr.key]}</h1>
        <svg class="icon" id="select-attribute-selected-icon"><use href="icons.svg#icon-selected-no"></use></svg>
      `;
      break;
  }

  return attributeDiv;
}

// Function to add click listener for shape type
function addShapeTypeClickListener(attributeDiv, item, label) {
  const attributeValueElement = attributeDiv.querySelector(".attribute-value");
  if (attributeValueElement) {
    attributeValueElement.addEventListener("click", () => {
      console.debug(`Attribute value clicked: ${label}`);
      // ... existing logic for showing options ...
    });
  }
}

// Function to update attribute value
function updateAttributeValue(key, delta, attributeDiv, typePrefix) {
  console.debug(`updateAttributeValue called with key: ${key}, delta: ${delta}`);
  const baseKey = key.replace(new RegExp(`^${typePrefix}_?`, "i"), "").split("_")[0];
  const fullKey = `${typePrefix}_${baseKey}`;

  if (!item.hasOwnProperty(fullKey)) {
    console.warn(`Key ${fullKey} does not exist. Initializing to 0.`);
    item[fullKey] = 0;
  }

  if (baseKey.toLowerCase().endsWith("width") || baseKey.toLowerCase().endsWith("height")) {
    const maxValue = jsonData.preset_info[baseKey.toLowerCase()];
    if (maxValue === undefined) {
      console.error(`Max value for ${baseKey} not found in preset_info.`);
      return;
    }
    item[fullKey] = Math.max(1, Math.min(item[fullKey] + delta, maxValue));
  } else if (baseKey.toLowerCase().endsWith("corners")) {
    item[fullKey] = Math.max(1, Math.min(item[fullKey] + delta, 360));
  } else {
    item[fullKey] += delta;
  }

  const attributeValueElement = attributeDiv.querySelector(".attribute-value");
  if (attributeValueElement) {
    attributeValueElement.textContent = item[fullKey];
    console.debug(`Attribute value updated: ${item[fullKey]}`);
  }
}

// Function to add value toggle listeners
function addValueToggleListeners(attributeDiv, item, key, typePrefix) {
  attributeDiv.querySelector("#subtract-twenty").addEventListener("click", () => updateAttributeValue(key, -20, attributeDiv, typePrefix));
  attributeDiv.querySelector("#subtract-one").addEventListener("click", () => updateAttributeValue(key, -1, attributeDiv, typePrefix));
  attributeDiv.querySelector("#add-one").addEventListener("click", () => updateAttributeValue(key, 1, attributeDiv, typePrefix));
  attributeDiv.querySelector("#add-twenty").addEventListener("click", () => updateAttributeValue(key, 20, attributeDiv, typePrefix));
}

// Function to add color picker listeners
function addColorPickerListeners(attributeDiv, pickr, item) {
  const hexValueElement = attributeDiv.querySelector("#hex-value");
  if (hexValueElement) {
    hexValueElement.addEventListener("click", () => {
      console.debug(`Hex value clicked: ${item.paint_color}`);
      pickr.show();
    });
  }
  const pickrButton = attributeDiv.querySelector(".pcr-button");
  if (pickrButton) {
    pickrButton.addEventListener("click", () => {
      console.debug("Pickr button clicked, showing color picker");
      pickr.show();
    });
  }
}

// Function to display attributes
function displayAttributes(itemIndex) {
  console.debug(`displayAttributes called with itemIndex: ${itemIndex}`);

  const dynamicAttributesContainer = document.getElementById("dynamic-attributes");
  if (!dynamicAttributesContainer) {
    console.error('Element with ID "dynamic-attributes" not found');
    return;
  }
  dynamicAttributesContainer.innerHTML = "";

  const item = jsonData.preset_root.viewgroup_items[itemIndex];
  if (!item) {
    console.error(`Item not found in jsonData at index ${itemIndex}`);
    return;
  }

  initializeAttributes(item);

  // Group attributes by tab
  const attributesByTab = {};
  Object.keys(attributeConfig).forEach((key) => {
    const config = attributeConfig[key];
    if (!attributesByTab[config.tab]) {
      attributesByTab[config.tab] = [];
    }
    attributesByTab[config.tab].push({ key, config });
  });

  // Display attributes for each tab
  Object.keys(attributesByTab).forEach((tab) => {
    const tabContainer = document.createElement("div");
    tabContainer.className = `tab-container ${tab}`;
    tabContainer.innerHTML = `<h2>${tab.charAt(0).toUpperCase() + tab.slice(1)} Attributes</h2>`;

    attributesByTab[tab].forEach(({ key, config }) => {
      const attributeDiv = createAttributeDisplay(config, item, pickr, item.internal_type.match(/^[a-z]+|[A-Z][a-z]*/g)[0].toLowerCase());
      tabContainer.appendChild(attributeDiv);
    });

    dynamicAttributesContainer.appendChild(tabContainer);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.debug("DOMContentLoaded event fired");

  function displayAttributes(itemIndex) {
    console.debug(`displayAttributes called with itemIndex: ${itemIndex}`);

    const dynamicAttributesContainer =
      document.getElementById("dynamic-attributes");
    if (!dynamicAttributesContainer) {
      console.error('Element with ID "dynamic-attributes" not found');
      return;
    }
    dynamicAttributesContainer.innerHTML = "";

    const item = jsonData.preset_root.viewgroup_items[itemIndex];
    if (!item) {
      console.error(`Item not found in jsonData at index ${itemIndex}`);
      return;
    }

    console.debug(`Item found: ${JSON.stringify(item)}`);

    const typePrefix = item.internal_type
      .match(/^[a-z]+|[A-Z][a-z]*/g)[0]
      .toLowerCase();
    console.debug(`Type prefix determined: ${typePrefix}`);

    const defaultAttributes = {
      ShapeModule: [
        { key: "shape_type", label: "Shape", id: "option-select" },
        { key: "shape_width", label: "Width", id: "value-toggle" },
        { key: "shape_height", label: "Height", id: "value-toggle" },
      ],
    };

    const typesWithoutHeight = ["SQUARE", "CIRCLE", "EXAGON", "SQUIRCLE"];
    console.debug(`Types without height: ${typesWithoutHeight.join(", ")}`);

    if (item.internal_type === "ShapeModule") {
      console.debug("Processing ShapeModule default attributes");
      defaultAttributes.ShapeModule.forEach((attr) => {
        if (!item.hasOwnProperty(attr.key)) {
          item[attr.key] = attr.key === "shape_type" ? "Square" : 1;
          console.debug(
            `Default attribute set: ${attr.key} = ${item[attr.key]}`
          );
        }
      });

      if (typesWithoutHeight.includes(item.shape_type)) {
        console.debug(
          `Deleting shape_height for shape type: ${item.shape_type}`
        );
        delete item.shape_height;
      } else {
        if (!item.hasOwnProperty("shape_height")) {
          item.shape_height = 20;
          console.debug(`Default shape_height set: ${item.shape_height}`);
        }
      }
    }

    const attributes = Object.keys(item).reduce((acc, key) => {
      const isDefaultAttribute = defaultAttributes.ShapeModule.some(
        (attr) => attr.key === key
      );
      if (isDefaultAttribute) return acc;

      let id = `option-${key}`;
      if (
        key.toLowerCase().endsWith("width") ||
        key.toLowerCase().endsWith("height") ||
        key.toLowerCase().endsWith("corners")
      ) {
        id = "value-toggle";
      } else if (key.toLowerCase() === "paint_color") {
        id = "option-hex";
      }

      let label = key
        .replace(new RegExp(`^${typePrefix}_?`, "i"), "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
      if (label.includes("Position Offset X")) label = "XOffset";
      else if (label.includes("Position Offset Y")) label = "YOffset";

      label = label
        .replace(/config stacking/i, "Stacking")
        .replace(/style style/i, "Style")
        .replace(/style width/i, "Width")
        .replace(/style height/i, "Height")
        .replace(/fx gradient/i, "Gradient");

      acc.push({ key, value: item[key], label, id });
      console.debug(
        `Attribute added: ${JSON.stringify({
          key,
          value: item[key],
          label,
          id,
        })}`
      );
      return acc;
    }, []);

    if (item.internal_type === "ShapeModule") {
      console.debug("Adding default ShapeModule attributes to attributes list");
      defaultAttributes.ShapeModule.forEach((attr) => {
        if (!item.hasOwnProperty(attr.key)) {
          item[attr.key] = attr.key === "shape_type" ? "Square" : 20;
        }
        attributes.push({
          key: attr.key,
          value: item[attr.key],
          label: attr.label,
          id: attr.id,
        });
        console.debug(
          `Default attribute added: ${JSON.stringify({
            key: attr.key,
            value: item[attr.key],
            label: attr.label,
            id: attr.id,
          })}`
        );
      });
    }

    function filterAndDisplayAttributes(filterTypes) {
      console.debug(
        `filterAndDisplayAttributes called with filterTypes: ${filterTypes.join(
          ", "
        )}`
      );

      // Ensure pickr is initialized
      if (!pickr) {
        console.error("Pickr is not initialized");
        return;
      }

      dynamicAttributesContainer.innerHTML = "";
      let foundAttributes = false;

      const currentShapeType = item.shape_type || "Square";
      console.debug(`Current shape_type: ${currentShapeType}`);

      if (!typesWithoutHeight.includes(currentShapeType.toUpperCase())) {
        if (!item.hasOwnProperty("shape_height")) {
          item.shape_height = 20;
          console.debug(
            `shape_height added back with default value: ${item.shape_height}`
          );
        }
      }

      attributes.forEach((attr) => {
        console.debug(
          `Processing attribute: ${attr.key}, value: ${attr.value}`
        );

        if (
          attr.key === "shape_height" &&
          typesWithoutHeight.includes(currentShapeType.toUpperCase())
        ) {
          console.debug(
            `Deleting shape_height for shape type: ${currentShapeType}`
          );
          delete item.shape_height;
          return;
        }

        if (
          filterTypes.some((filterType) =>
            attr.key.toLowerCase().includes(filterType.toLowerCase())
          )
        ) {
          foundAttributes = true;
          const attributeDiv = createAttributeDisplay(attr, item, pickr, typePrefix);
          dynamicAttributesContainer.appendChild(attributeDiv);
        }
      });

      if (!foundAttributes) {
        console.warn(`No attributes found with types: ${filterTypes}`);
      }
    }

    document.querySelectorAll(".attribute-type").forEach((typeDiv) => {
      typeDiv.addEventListener("click", () => {
        const filterType = typeDiv.id.split("-")[0];
        const filterCriteria =
          filterType === "style" ? [filterType, typePrefix] : [filterType];
        console.debug(`Attribute type clicked: ${filterType}`);
        filterAndDisplayAttributes(filterCriteria);
      });
    });

    filterAndDisplayAttributes([typePrefix, "style"]);
  }

  document.querySelectorAll(".sortable").forEach((option, index) => {
    option.addEventListener("click", () => {
      console.debug(`Sortable item clicked: index ${index}`);
      displayAttributes(index);
    });
  });

  const overlay = document.getElementById("overlay");
  const body = document.body;

  document.addEventListener(
    "click",
    (event) => {
      const attributesDropdown = document.getElementById(
        "attributes-option-select"
      );
      if (
        attributesDropdown &&
        attributesDropdown.style.display === "block" &&
        !attributesDropdown.contains(event.target)
      ) {
        console.debug("Click outside attributes dropdown detected");
        event.stopPropagation();
        event.preventDefault();
      }
    },
    true
  );

  document.addEventListener("dblclick", (event) => {
    const attributesDropdown = document.getElementById(
      "attributes-option-select"
    );
    if (
      attributesDropdown &&
      attributesDropdown.style.display === "block" &&
      !attributesDropdown.contains(event.target)
    ) {
      console.debug("Double-click outside attributes dropdown detected");
      attributesDropdown.style.display = "none";
      overlay.style.display = "none";
      body.classList.remove("modal-open");
    }
  });

  const attributesDropdown = document.getElementById(
    "attributes-option-select"
  );
  if (attributesDropdown) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "style") {
          const isVisible = attributesDropdown.style.display === "block";
          console.debug(`Attributes dropdown visibility changed: ${isVisible}`);
          body.classList.toggle("modal-open", isVisible);
          overlay.style.display = isVisible ? "block" : "none";
        }
      });
    });

    observer.observe(attributesDropdown, { attributes: true });
  }
});

const shapeTypeDisplayNames = {
  "": "Square",
  CIRCLE: "Circle",
  RECT: "Rectangle",
  OVAL: "Oval",
  TRIANGLE: "Triangle",
  RTRIANGLE: "Right Triangle",
  EXAGON: "Hexagon",
  SLICE: "Circle Slice",
  ARC: "Arc",
  SQUIRCLE: "Squircle",
  PATH: "Path",
};

function getShapeTypeDisplayName(value) {
  console.debug(`getShapeTypeDisplayName called with value: ${value}`);
  return shapeTypeDisplayNames[value] || value;
}

