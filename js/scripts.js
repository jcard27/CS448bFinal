


// Add an SVG element to the DOM
var svg = d3.select('#plot1div').append('svg') //d3.select('body').append('svg')
  .attr('width', screen.width)
  .attr('height', screen.height);

//Load data
d3.csv("/data/filtered_finalProjectDataset.csv", parseInputRow).then(loadData);

//Parse CSV rows and returns array of objects with the specified fields.
function parseInputRow (d) {
    return {
       name : d.FCID_Desc,
       portion_desc : d. Portion_description,
       ghge_portion : +d.kgCO2perPortion,
       kcal_portion : +d.kcalPortion,
       protein_portion : +d.proteinPortion,
       carbs_portion : +d.carbsPortion,
       fat_portion : +d.fatPortion,
       sugar_portion : +d.sugarPortion,
       fruit : +d.Fruit,
       veg : +d.Veg,
       meat : +d.Meat,
       dairy : +d.Dairy,
       grain : +d.Grain,
       protein : +d.Protein,
       oil : +d.Oil,
       beverage : +d.Beverage

   };
};

//Callback for d3.csv (all data related tasks go here)
function loadData(loadedData){
   csvData = loadedData
   generateVis(csvData);
};

//Generate visualization using parsed data from CSV (array of objects)
function generateVis(csvData){
  ///////////////// Declaring Vars /////////////////////

  //For dropdown code: https://bl.ocks.org/ProQuestionAsker/8382f70af7f4a7355827c6dc4ee8817d
  var dropdown1 = d3.select("#dropdown1div")
  dropdown1.append("select")
           .selectAll("option")
           .data(csvData)
           .enter()
           .append("option")
           .attr("value", function(d){return d.name;})
           .text(function(d){return d.name;})

  let plotMargin = 100;
  let plotWidth = 500; //500;
  let plotHeight = 500; //500;

  let plot1 = svg.append('g')
                 .attr('transform', `translate(${plotMargin}, ${plotMargin})`);
  let xScale = d3.scaleLinear()
                 .domain([0,400])
                 .range([0, plotWidth]);
  let yScale = d3.scaleLinear()
                .domain([0,3.5])
                .range([plotHeight, 0]);
  let xAxis = plot1.append('g')
                  .attr('transform', `translate(0, ${plotHeight})`)
                  .call(d3.axisBottom(xScale));
  let yAxis = plot1.append('g')
                  .call(d3.axisLeft(yScale));
  let annotationGroup = plot1.append('g');



  addCircles(csvData, plot1, "plot1AllCircles", xScale, yScale);

  //Add circles to plot1
  function addCircles(filteredPoints, plot, circleClass, xScale, yScale) {
    var circles = plot.selectAll("circle")
                    .data(filteredPoints)
     circles.enter().append("circle")
        .merge(circles)
        .attr("class", circleClass)
        .attr("cx", function (d) {return xScale(d.kcal_portion);})
        .attr("cy", function (d) {return yScale(d.ghge_portion);})
     circles.exit().remove();
     plot.selectAll("circle")
                    .on("mouseover",	displayName)
                    .on("mouseout", undisplay);
  };

  // Highights circle with stroke and displays restaurant name
  function displayName (d) {
    var xPos = this.cx.animVal.value;
    var yPos = this.cy.animVal.value;
    var name = d3.select(this).datum().name;
    // var score = d3.select(this).datum().inspection_score;
    var highlightedPoint = d3.select(this)
                             .attr("r", 4)
                             .style("stroke", "black")
                             .style("stroke-width", "2");
      annotationGroup.append("text")
                     .attr("x", xPos - 4)
                     .attr("y", yPos - 22)
                     .attr("class", "annotations")
                     .text(name);
      // annotationGroup.append("text")
      //                .attr("x", xPos - 4)
      //                .attr("y", yPos - 8)
      //                .attr("class", "annotations")
      //                .text("Inspection score: " + score);
  };

  // Undoes the highlighting from displayName (removes stroke and annotation)
  function undisplay (d) {
    d3.select(this)
      .attr("r", 2)
      .style("stroke-width", "0")
    annotationGroup.selectAll("text").remove();
  }


 };

//////////////////////////////////////////////////////////////////////////
//Utility Functions
/////////////////////////////////////////////////////////////////////////

// Move slider marker and label
//Returns new value corresponding to slider position
function moveSlider (event, sliderPos, xMin, xMax, range, marker, label, offset) {
    var sliderPos;
    var newValue;
    if (event.x < xMin) {
      sliderPos = [xMin];
    } else if (xMax < event.x) {
        sliderPos = [xMax];
    } else {
        sliderPos = [event.x];
    }
    newValue = ((xMin - sliderPos[0])*range)/(xMin - xMax) + offset;
    marker.attr("cx", sliderPos)
    label.attr("x", sliderPos)
                 .text(parseFloat(newValue.toFixed(2)))
   return newValue;
};

// Filter data to only return data with a score above minimumScore
function filterByScore(data, minimumScore) {
    var filteredPoints = data.filter(function (d) {
        return d.inspection_score > minimumScore
    });
    return filteredPoints;
};

//Filter CSV data for points lying within a given radius of 2 points
function getPoints(data, rPxA, rPxB, posA, posB){
    var closePoints = data.filter(function (d) {
        var distA = Math.abs(Math.sqrt(
                        Math.pow((d.proj[0] - posA[0].x), 2)
                        +
                        Math.pow((d.proj[1] - posA[0].y),2)
                    ));
        var distB = Math.abs(Math.sqrt(
                        Math.pow((d.proj[0] - posB[0].x), 2)
                        +
                        Math.pow((d.proj[1] - posB[0].y),2)
                    ));
        return (distA < rPxA && distB < rPxB);
    });
    return closePoints;
};

//Calculate distance in miles between 2 points
function calcDist(loc1, loc2){
// Inputs:
// loc1 - [longitude, latitude] of location 1
// loc2 - [longitude, latitude] of location 2
// Output:
// dist - distance in miles between locations 1 and 2
//
// Note: I used example from https://bl.ocks.org/ThomasThoren/6a543c4d804f35a240f9 here
    var radians = d3.geoDistance(loc1, loc2);
    var earth_radius = 3959;  // miles
    var dist = earth_radius * radians;
    return dist;
};

//Calculate radius in pixels given a radius in miles
function calcPxRadius(rMiles, degreesPerPixel){
    var earth_radius = 3959;  // miles
    var radians = rMiles/earth_radius;
    var degrees = (radians * 180)/3.14159;
    var rPixels = Math.abs(degrees/degreesPerPixel);
    return rPixels;
};
