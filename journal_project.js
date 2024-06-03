let table;
let journal = [];
let maxCircles = 6; // Maximum number of circles per half rectangle
let canvas;
let hoverInfo;

function preload() {
  loadTable("journal_project.php", "csv", "header", (data) => {
    table = data;
    dataLoaded();
  });
}

function setup() {
  // const canvasContainer = document.getElementById('canvasContainer');
  // canvas = createCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
  // canvas.parent('canvasContainer');
  // textAlign(LEFT, TOP);
  const canvasContainer = document.getElementById('canvasContainer');
  canvas = createCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
  canvas.parent('canvasContainer');
  textAlign(LEFT, TOP);

  // Create a new div for displaying hover information
  hoverInfo = createDiv('');
  hoverInfo.id('hoverInfo');
  hoverInfo.style('display', 'none');

  // Store the date input values
  startDateInput = document.getElementById('startDate');
  endDateInput = document.getElementById('endDate');

  // Add event listeners to date inputs
  startDateInput.addEventListener('change', filterDates);
  endDateInput.addEventListener('change', filterDates);

  // Create gradient key
  const gradientKey = createColorKey();
  const controlsDiv = document.getElementById('controls');
  controlsDiv.appendChild(gradientKey.elt);

}

function dataLoaded() {

  if (!table) {
    console.error('Table data not loaded correctly');
    return;
  }

  for (let r = 1; r < table.getRowCount(); r++) {
    let drink_oz_str = table.getString(r, 3);
    let drink_oz = parseInt(drink_oz_str, 10); // Convert string to integer
    let food_cal_str = table.getString(r, 4);
    if (food_cal_str === undefined) {
      console.warn(`Row ${r}, column 3 is undefined. Skipping...`);
      continue;
    }
    let food_cal = parseInt(food_cal_str, 10); // Convert string to integer
    let date = table.getString(r, 0);
    let drinks = table.getString(r, 2);
    let food = table.getString(r, 1);


    const totalCircles = Math.min(Math.floor(drink_oz / 8), maxCircles * 2);
    console.log("Total Circles:", totalCircles); // Check the total circles value

    const circlesCountTop = Math.floor(Math.random() * (totalCircles + 1));
    const circlesCountBottom = totalCircles - circlesCountTop;
    console.log("Circles Top:", circlesCountTop, "Circles Bottom:", circlesCountBottom); // Check the circle counts

    journal.push({ date: date, drink_oz: drink_oz, drinks: drinks, food: food, food_cal: food_cal, circlesCountTop: circlesCountTop, circlesCountBottom: circlesCountBottom });

  }

  console.log(journal);
}

function filterDates() {
  const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
  const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

  journal = journal.filter(entry => {
    const entryDate = new Date(entry.date);
    if (!startDate && !endDate) {
      return true; // Show all entries if no date range is selected
    } else if (!startDate) {
      return entryDate <= endDate; // Filter by end date only
    } else if (!endDate) {
      return entryDate >= startDate; // Filter by start date only
    } else {
      return entryDate >= startDate && entryDate <= endDate; // Filter by both start and end dates
    }
  });
}

function draw() {
  clear();
  // background(255);

  // Filtered journal entries based on date range
  let filteredEntries = journal.filter(entry => {
    const entryDate = new Date(entry.date);
    const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

    if (!startDate && !endDate) {
      return true; // Show all entries if no date range is selected
    } else if (!startDate) {
      return entryDate <= endDate; // Filter by end date only
    } else if (!endDate) {
      return entryDate >= startDate; // Filter by start date only
    } else {
      return entryDate >= startDate && entryDate <= endDate; // Filter by both start and end dates
    }
  });

  // Sort the filtered journal array by date
  filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalDays = filteredEntries.length;
  const maxCols = 7; // Maximum number of columns (rectangles per row)
  const numRows = Math.ceil(totalDays / maxCols); // Number of rows based on totalDays and maxCols
  const numCols = Math.min(totalDays, maxCols); // Number of columns, limited by maxCols
  const rectWidth = 80; // Width of each rectangle
  const rectHeight = 100; // Height of each rectangle
  const circleRadius = 10; // Radius of circles
  const paddingX = 20; // Horizontal padding between rectangles
  const paddingY = 20; // Vertical padding between rectangles
  const startX = (width - (numCols * (rectWidth + paddingX))) / 2;
  const startY = (height - (numRows * (rectHeight + paddingY))) / 2;
  const cornerRadius = 10; // Radius for rounded corners

  const canvasWidth = numCols * (rectWidth + paddingX) + paddingX;
  const canvasHeight = numRows * (rectHeight + paddingY) + paddingY;

  resizeCanvas(canvasWidth, canvasHeight);

  let index = 0; // Index to keep track of the current entry

    // Calculate averages
    const { avgFoodCal, avgDrinkOz } = calculateAverages(filteredEntries);
    

     // Calculate standard deviation of food_cal
  const foodCalValues = filteredEntries.map(entry => entry.food_cal);
  const stdDevFoodCal = calculateStandardDeviation(foodCalValues);

    // Display averages in the details box
    const detailsBox = document.getElementById('averages');
    detailsBox.innerHTML = `
      <p style = "font-size:30pt; display: inline; "> ${avgFoodCal} </p> <p style="font-size: 18pt; display:inline;"> cal </p> \n 
      <p>Average Food (Calories):</p>
      <p style = "font-size:30pt; display: inline; "> ${avgDrinkOz} </p> <p style="font-size: 18pt; display:inline;"> oz </p> \n   
      <p>Average Drinks (Oz): </p> <br><hr><br>
    `;

  // Draw rectangles with circles
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols && index < totalDays; col++) {
      const x = startX + col * (rectWidth + paddingX);
      const y = startY + row * (rectHeight + paddingY);

      const circlesCountTop = filteredEntries[index].circlesCountTop;
      const circlesCountBottom = filteredEntries[index].circlesCountBottom;

      // NEW CODE
      // Calculate the color based on deviation from average
      const foodCal = filteredEntries[index].food_cal;
      const { avgFoodCal, stdDevFoodCal } = calculateStandardDeviation(filteredEntries);

      const deviationPercent = (foodCal - avgFoodCal) / stdDevFoodCal;
      const rectColor = getColorForDeviation(deviationPercent);

      // Draw rectangle
      fill(255); // Color for rectangle
      stroke(0);
      rectMode(CENTER);
      rect(x + rectWidth / 2, y + rectHeight / 2, rectWidth, rectHeight, cornerRadius); // Draw rectangle

      // Draw line dividing the rectangle in half
      stroke(0);
      line(x, y + rectHeight / 2, x + rectWidth, y + rectHeight / 2);
    
      // Draw circles in the each half of the rectangle
      fill(rectColor);
      drawCircles(x, y, rectWidth, rectHeight, circlesCountTop, circleRadius, 'top', rectColor);
      drawCircles(x, y, rectWidth, rectHeight, circlesCountBottom, circleRadius, 'bottom', rectColor);

      // Display date outside the rectangle
      textAlign(CENTER, CENTER);
      textFont('Georgia');
      strokeWeight(0.4);
      textSize(11);
      fill(0);
      text(filteredEntries[index].date, x + rectWidth / 2, y + rectHeight + paddingY / 2);

      index++;
    }
  }

  // Check if the mouse is hovering over a dominio
  const hoveredRect = checkHoveredRect(startX, startY, rectWidth, rectHeight, paddingX, paddingY, numRows, numCols, totalDays, filteredEntries);
  if (hoveredRect) {
    // textFont = 'Georgia';
    const { date, drink_oz, drinks, food, food_cal } = hoveredRect;
    const hoverText = `Date: ${date} <br>Drinks: ${drink_oz} oz. <br><em> ${drinks}</em> <br> Food: ${food_cal} calories <br> <em> ${food} </em>`;
    hoverInfo.html(hoverText);
    hoverInfo.style('display', 'block');
    hoverInfo.position(mouseX + 10, mouseY + 10); // Position the hover info near the mouse cursor
  } else {
    hoverInfo.style('display', 'none');
  }

}

function windowResized() {
  const canvasContainer = document.getElementById('canvasContainer');
  resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
}

function drawCircles(x, y, rectWidth, rectHeight, circlesCount, circleRadius, half, rectColor) {
  let startX, startY, spacing;

  fill(rectColor);

  // Reduce the circle radius
  circleRadius = 6;

  // Determine start coordinates and spacing based on half (top or bottom)
  if (half === 'top') {
    startY = y+15;
    startX = x + rectWidth / 4;
    spacing = rectWidth / 4;
  } else {
    startY = (y + rectHeight / 2)+15;
    startX = x + rectWidth / 4;
    spacing = rectWidth / 4;
  }

  // Adjust the spacing and positioning
  spacing = spacing * 0.8;
  startX += spacing * 0.2;
  startY -= circleRadius;

    // Limit the circlesCount to the maximum allowed (6)
    circlesCount = Math.min(circlesCount, 6);

  // Draw circles based on the dice face arrangement
  if (circlesCount === 1) {
    // Center
    const circleX = startX + spacing;
    const circleY = startY + spacing;
    ellipse(circleX, circleY, circleRadius * 2, circleRadius * 2);
  } else if (circlesCount === 2) {
    // Diagonal
    const circleX1 = startX + spacing * 0.5;
    const circleY1 = startY + spacing * 0.5;
    const circleX2 = startX + spacing * 1.5;
    const circleY2 = startY + spacing * 1.5;
    ellipse(circleX1, circleY1, circleRadius * 2, circleRadius * 2);
    ellipse(circleX2, circleY2, circleRadius * 2, circleRadius * 2);
  } else if (circlesCount === 3) {
    // Center and diagonals
    const circleX1 = startX + spacing * 0.2;
    const circleY1 = startY + spacing * 0.2;
    const circleX2 = startX + spacing;
    const circleY2 = startY + spacing;
    const circleX3 = startX + spacing * 1.8;
    const circleY3 = startY + spacing * 1.8;
    ellipse(circleX1, circleY1, circleRadius * 2, circleRadius * 2);
    ellipse(circleX2, circleY2, circleRadius * 2, circleRadius * 2);
    ellipse(circleX3, circleY3, circleRadius * 2, circleRadius * 2);
  } else if (circlesCount === 4) {
    // Corners
    const circleX1 = startX + spacing * 0.35;
    const circleY1 = startY + spacing * 0.35;
    const circleX2 = startX + spacing * 1.65;
    const circleY2 = startY + spacing * 0.35;
    const circleX3 = startX + spacing * 0.35;
    const circleY3 = startY + spacing * 1.65;
    const circleX4 = startX + spacing * 1.65;
    const circleY4 = startY + spacing * 1.65;
    ellipse(circleX1, circleY1, circleRadius * 2, circleRadius * 2);
    ellipse(circleX2, circleY2, circleRadius * 2, circleRadius * 2);
    ellipse(circleX3, circleY3, circleRadius * 2, circleRadius * 2);
    ellipse(circleX4, circleY4, circleRadius * 2, circleRadius * 2);
  } else if (circlesCount === 5) {
    // Corners and center
    const circleX1 = startX + spacing * 0.25;
    const circleY1 = startY + spacing * 0.25;
    const circleX2 = startX + spacing * 1.75;
    const circleY2 = startY + spacing * 0.25;
    const circleX3 = startX + spacing;
    const circleY3 = startY + spacing;
    const circleX4 = startX + spacing * 0.25;
    const circleY4 = startY + spacing * 1.75;
    const circleX5 = startX + spacing * 1.75;
    const circleY5 = startY + spacing * 1.75;
    ellipse(circleX1, circleY1, circleRadius * 2, circleRadius * 2);
    ellipse(circleX2, circleY2, circleRadius * 2, circleRadius * 2);
    ellipse(circleX3, circleY3, circleRadius * 2, circleRadius * 2);
    ellipse(circleX4, circleY4, circleRadius * 2, circleRadius * 2);
    ellipse(circleX5, circleY5, circleRadius * 2, circleRadius * 2);
  }
  else if (circlesCount === 6) {
    // 3 by 2 grid
    const circleX1 = startX + spacing * 0.35;
    const circleY1 = startY + spacing * 0.15;
    const circleX2 = startX + spacing * 1.75;
    const circleY2 = startY + spacing * 0.15;
    const circleX3 = startX + spacing * 0.35;
    const circleY3 = startY + spacing;
    const circleX4 = startX + spacing * 1.75;
    const circleY4 = startY + spacing;
    const circleX5 = startX + spacing * 0.35;
    const circleY5 = startY + spacing * 1.85;
    const circleX6 = startX + spacing * 1.75;
    const circleY6 = startY + spacing * 1.85;
    ellipse(circleX1, circleY1, circleRadius * 2, circleRadius * 2);
    ellipse(circleX2, circleY2, circleRadius * 2, circleRadius * 2);
    ellipse(circleX3, circleY3, circleRadius * 2, circleRadius * 2);
    ellipse(circleX4, circleY4, circleRadius * 2, circleRadius * 2);
    ellipse(circleX5, circleY5, circleRadius * 2, circleRadius * 2);
    ellipse(circleX6, circleY6, circleRadius * 2, circleRadius * 2);
  }
}

function checkHoveredRect(startX, startY, rectWidth, rectHeight, paddingX, paddingY, numRows, numCols, totalDays, filteredEntries) {
  let index = 0;

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols && index < totalDays; col++) {
      const x = startX + col * (rectWidth + paddingX);
      const y = startY + row * (rectHeight + paddingY);

      if (
        mouseX >= x &&
        mouseX <= x + rectWidth &&
        mouseY >= y &&
        mouseY <= y + rectHeight
      ) {
        return filteredEntries[index];
      }

      index++;
    }
  }

  return null;
}

function calculateAverages(filteredEntries) {
  const totalEntries = filteredEntries.length;
  const totalFoodCal = filteredEntries.reduce((sum, entry) => sum + entry.food_cal, 0);
  const totalDrinkOz = filteredEntries.reduce((sum, entry) => sum + entry.drink_oz, 0);

  const avgFoodCal = totalFoodCal / totalEntries;
  const avgDrinkOz = totalDrinkOz / totalEntries;

  return {
    avgFoodCal: avgFoodCal.toFixed(0),
    avgDrinkOz: avgDrinkOz.toFixed(0)
  };
}

// function calculateStandardDeviation(values) {
//   const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
//   const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
//   const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
//   const stdDev = Math.sqrt(avgSquaredDiff);
//   return stdDev;
// }

function calculateStandardDeviation(filteredEntries) {
  const totalEntries = filteredEntries.length;
  const totalFoodCal = filteredEntries.reduce((sum, entry) => sum + entry.food_cal, 0);
  const avgFoodCal = totalFoodCal / totalEntries;

  // Calculate standard deviation
  const squaredDiffs = filteredEntries.map(entry => Math.pow(entry.food_cal - avgFoodCal, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
  const stdDevFoodCal = Math.sqrt(avgSquaredDiff);

  return {
    avgFoodCal,
    stdDevFoodCal
  };
}

function getColorForDeviation(deviationPercent) {
  const deviationThreshold = 0.1;
  const minColorValue = 200; // Minimum color value (lightest shade)
  const maxColorValue = 245; // Maximum color value (darkest shade)
  const midColorValue = 220; // Middle color value

  if (deviationPercent < -deviationThreshold) {
    // Below average: Use blue shades (darker towards the left)
    const blueValue = Math.round(minColorValue + (maxColorValue - minColorValue) * (1 + deviationPercent));
    return color(0, 150, blueValue);
  } else if (deviationPercent > deviationThreshold) {
    // Above average: Use pink shades (lighter towards the left)
    const pinkValue = Math.round(minColorValue + (maxColorValue - minColorValue) * Math.abs(deviationPercent));
    return color(pinkValue, 150, pinkValue);
  } else {
    // Close to average: Use a middle color value
    return color(midColorValue, midColorValue, midColorValue);
  }
}



function createColorKey() {
  const colorKeyWidth = 200;
  const colorKeyHeight = 20;

  const colorKey = createDiv('');
  colorKey.id('colorKey');
  colorKey.style('width', `${colorKeyWidth}px`);
  colorKey.style('height', `${colorKeyHeight}px`);
  colorKey.style('display', 'flex');
  colorKey.style('align-items', 'center');
  colorKey.style('position', 'relative');

  // Generate the color gradient using getColorForDeviation
  const numSteps = 100;
  let gradientColors = '';
  for (let i = 0; i < numSteps; i++) {
    const deviationPercent = (i / (numSteps - 1)) * 2 - 1; // Map i to the range [-1, 1]
    const colorValue = getColorForDeviation(deviationPercent);
    if (colorValue) {
      gradientColors += `,rgb(${colorValue.levels[0]}, ${colorValue.levels[1]}, ${colorValue.levels[2]})`;
    }
  }
  colorKey.style('background', `linear-gradient(to right${gradientColors})`);

  const lowLabel = createDiv('Low Average');
  lowLabel.class('keyLabel');
  lowLabel.style('left', '0');

  const avgLabel = createDiv('|');
  avgLabel.class('keyLabel');
  avgLabel.style('left', '50%');
  avgLabel.style('transform', 'translateX(-50%)');

  const highLabel = createDiv('High Average');
  highLabel.class('keyLabel');
  highLabel.style('right', '0');

  colorKey.child(lowLabel);
  colorKey.child(avgLabel);
  colorKey.child(highLabel);

  return colorKey;
}