// Module configuration for each type
const moduleMappings = {
  KomponentModule: {
    icon: "icons.svg#icon-komponent",
    name: "Komponent",
    description: (item) => formatGlobalsList(item.globals_list), // Access globals_list from item
  },
  TextModule: {
    icon: "icons.svg#icon-text",
    name: "Text",
    description: (item) => getTextExpression(item.text_expression),
  },
  ShapeModule: {
    icon: "icons.svg#icon-shape",
    name: "Shape",
    description: (item) => formatShapeType(item.shape_type),
  },
  BitmapModule: {
    icon: "icons.svg#icon-image",
    name: "Image",
    description: (item) => getImageDescription(item.bitmap_width),
  },
  FontIconModule: {
    icon: "icons.svg#icon-fonticon",
    name: "Fonticon",
    description: (item) => formatFontIconDescription(item),
  },
  ProgressModule: {
    icon: "icons.svg#icon-progress",
    name: "Progress",
    description: (item) => formatProgressDescription(item),
  },
  CurvedTextModule: {
    icon: "icons.svg#icon-morphing-text",
    name: "Morphing Text",
    description: (item) => getTextExpression(item.text_expression),
  },
  SeriesModule: {
    icon: "icons.svg#icon-series",
    name: "Series",
    description: (item) => formatSeriesDescription(item),
  },
  OverlapLayerModule: {
    icon: "icons.svg#icon-overlap-group",
    name: "Overlap Group",
    description: (item) => {
      // Generate descriptions for each item in viewgroup_items
      const descriptions =
        item.viewgroup_items?.map((nestedItem) => {
          const nestedConfig = moduleMappings[nestedItem.internal_type];
          if (nestedConfig && typeof nestedConfig.description === "function") {
            return nestedConfig.description(nestedItem); // Use description function if available
          }
          return nestedConfig ? nestedConfig.name : "Unknown"; // Fallback if no function or type is unknown
        }) || [];

      return descriptions.join(", "); // Join descriptions with commas
    },
  },
  StackLayerModule: {
    icon: "icons.svg#icon-stack-group",
    name: "Stack Group",
    description: (item) => {
      // Generate descriptions for each item in viewgroup_items
      const descriptions =
        item.viewgroup_items?.map((nestedItem) => {
          const nestedConfig = moduleMappings[nestedItem.internal_type];
          if (nestedConfig && typeof nestedConfig.description === "function") {
            return nestedConfig.description(nestedItem); // Use description function if available
          }
          return nestedConfig ? nestedConfig.name : "Unknown"; // Fallback if no function or type is unknown
        }) || [];

      return descriptions.join(", "); // Join descriptions with commas
    },
  },

  MovieModule: {
    icon: "icons.svg#icon-animated-image",
    name: "Animated Image",
    description: (item) => getImageDescription(item.bitmap_width),
  },
};

// Helper functions
// ==============================================================================

// Helper function to format globals list
function formatGlobalsList(globalsList) {
    if (!globalsList) return ""; // Return empty string if no globals_list
  
    // Map through the entries of globals_list and format them
    return Object.keys(globalsList)
      .map((key) => {
        const globalItem = globalsList[key];
        return `${globalItem.title}:${globalItem.value}`; // Format as title:value
      })
      .join(", "); // Join all entries with a comma
  }

// Formats shape_type descriptions
function formatShapeType(shapeType) {
  if (!shapeType) return "Square"; // Default if shape_type is missing
  return (
    shapeType[0].toUpperCase() + shapeType.slice(1).toLowerCase() + "angle"
  ); // Expands RECT to Rectangle, etc.
}

// Gets text expression or falls back to the current time
function getTextExpression(textExpression) {
  if (textExpression) return `${textExpression}`; // Use text_expression if available, wrap in $$
  const now = new Date();
  return `$${now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}$`; // Fallback to current time
}

// Gets image description based on bitmap_width
function getImageDescription(bitmapWidth) {
  if (bitmapWidth) {
    const size = Math.floor(bitmapWidth / 1.33); // Calculate size using division and round down
    return `Image ${size} x ${size}`; // Square dimensions
  }
  return "Image 75 x 75"; // Default square dimensions
}

// Formats progress descriptions
function formatProgressDescription(item) {
  const type = item.progress_progress
    ? formatWithSpaces(item.progress_progress)
    : "Battery"; // Default if progress_progress is missing
  const style = item.style_style === "CIRCLE" ? "Circular" : "Linear"; // Default to Linear
  const progressMode = item.progress_mode
    ? item.progress_mode.toLowerCase() + " progress"
    : "Flat Progress"; // Default to Flat Progress
  return `${type} (${style}, ${progressMode})`; // Combine formatted values
}

// Formats string with spaces and capitalization
function formatWithSpaces(value) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Formats FontIcon descriptions
function formatFontIconDescription(item) {
  const iconSet = item.icon_set || ""; // Get icon_set or set as empty string if not defined
  let pack = "Material"; // Default to "Material"
  let icon = item.icon_icon || "NONE"; // Default icon to "NONE" if not defined

  if (iconSet) {
    // Extract the pack name from icon_set
    const lastSlashIndex = iconSet.lastIndexOf("/");
    const packWithTTF =
      lastSlashIndex !== -1 ? iconSet.substring(lastSlashIndex + 1) : ""; // Get the substring after the last slash
    pack = packWithTTF.endsWith(".ttf")
      ? packWithTTF.slice(0, -4) // Remove .ttf extension if it exists
      : packWithTTF; // Keep it as is if it does not end with .ttf
    pack = formatWithSpaces(pack); // Format to add spaces and capitalize words
  }

  return `${pack} => ${icon}`; // Return the formatted description
}

// Helper function to format Series descriptions
function formatSeriesDescription(item) {
  const series = item.series_series || ""; // Get series_series or set as empty string if not defined
  const style = item.style_style === "CIRCLE" ? "Circular" : "Linear"; // Define style based on style_style

  let t = ""; // Initialize t
  let n = ""; // Initialize n

  // Determine the series type and number (if applicable)
  switch (series) {
    case "H12":
      t = "Hours";
      n = "12h"; // Set n for 12-hour format
      break;
    case "H24":
      t = "Hours";
      n = "24h"; // Set n for 24-hour format
      break;
    case "MINS":
      t = "Minutes";
      break;
    case "MINS_5":
      t = "Minutes";
      n = "5 mins step"; // Set n for 5 minutes
      break;
    case "SECS":
      t = "Seconds";
      break;
    case "BATTERY":
      t = "Battery";
      break;
    case "DAY_OF_WEEK":
      t = "Day of Week";
      break;
    case "DAY_OF_WEEK_SHORT":
      t = "Day of Week (Short)";
      break;
    case "DAY_OF_WEEK_NUM":
      t = "Day of Week (Number)";
      break;
    case "MONTH":
      t = "Month";
      break;
    case "MONTH_SHORT":
      t = "Month (Short)";
      break;
    case "CUSTOM":
      t = "Custom";
      break;
    default:
      t = "Battery"; // Fallback if series_series does not match any case
      n = "0 to 9";
      break;
  }

  // Return formatted description
  return `${t}${n ? ` (${n})` : ""} (${style})`; // Construct the final description
}

// Generalized function to get module properties
function getModuleProperties(item) {
  const { internal_type, internal_title, icon } = item;
  const moduleConfig = moduleMappings[internal_type] || {
    icon: "",
    name: "Unnamed",
    description: "",
  };

  // Icon: prioritize item icon, fall back to config
  const finalIcon = icon || moduleConfig.icon;

  // Name: prioritize internal_title, fall back to moduleConfig name
  const finalName = internal_title || moduleConfig.name;

  // Description: check if description in moduleConfig is a function (for dynamic descriptions)
  let finalDescription =
    typeof moduleConfig.description === "function"
      ? moduleConfig.description(item) // If function, pass item for dynamic generation
      : moduleConfig.description; // Otherwise, use description from config

  // Calculate 25% of the viewport width
  const maxLength = Math.floor(window.innerWidth * 0.25);

  // Truncate description to maxLength with ellipsis if necessary
  if (finalDescription.length > maxLength) {
    finalDescription = finalDescription.substring(0, maxLength) + "...";
  }

  return { finalIcon, finalName, finalDescription, maxLength };
}


// Load preset data from local storage and create options dynamically
function loadPresetData() {
  console.log("Starting loadPresetData function...");

  const rawData = localStorage.getItem("presetData");
  console.log("Raw preset data from local storage:", rawData);

  const presetData = JSON.parse(rawData) || {};
  console.log("Parsed preset data:", JSON.stringify(presetData, null, 2));

  const viewgroupItems = presetData.preset_root?.viewgroup_items || [];
  const itemCount = viewgroupItems.length;

  if (itemCount > 0) {
    console.log(`Found ${itemCount} items in presetData.preset_root.viewgroup_items.`);

    viewgroupItems.forEach((item, index) => {
      console.log(`Processing item ${index + 1} of ${itemCount}:`, JSON.stringify(item, null, 2));

      const { finalIcon, finalName, finalDescription } = getModuleProperties(item);

      if (item.internal_type) {
        console.log(`Creating option for item ${index + 1} with type '${item.internal_type}', name '${finalName}', icon '${finalIcon}', and description '${finalDescription}'.`);
        createGeneralOption(item.internal_type, finalIcon, finalName, finalDescription, true, false); // Pass false for saveToJson
        console.log(`Successfully created option for item ${index + 1}.`);
      } else {
        console.warn(`Skipping item ${index + 1} - missing required property: internal_type.`);
      }
    });
  } else {
    console.log("No viewgroup_items found in presetData.preset_root or preset_root is missing.");
  }

  console.log("Completed loadPresetData function.");
}

