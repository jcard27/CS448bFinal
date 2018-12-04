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
  createPlot1(csvData)
  createPlot2(csvData)

 };

//Create Scatterplot
function createPlot1 (csvData) {
// Add an SVG element to the DOM
 let titleOffset = 10;
 let axisOffset = 35;
 let refAnnotationOffset = 2;
 let plotMargin = 100;
 let plotWidth = 500; //500;
 let plotHeight = 500; //500;

 var svg1 = d3.select('#plot1div').append('svg')
   .attr('width', plotWidth + plotMargin*2)
   .attr('height', plotHeight + plotMargin*2);

 let plot1 = svg1.append('g')
                .attr('transform', `translate(${plotMargin}, ${plotMargin})`);
 let xScale = d3.scaleLinear()
                .domain([0,400])
                .range([0, plotWidth]);
 let yScale = d3.scaleLinear()
               .domain([0,3.5])
               .range([plotHeight, 0]);
 let xAxis1 = plot1.append('g')
                 .attr('transform', `translate(0, ${plotHeight})`)
                 .call(d3.axisBottom(xScale));
 let yAxis1 = plot1.append('g')
                 .call(d3.axisLeft(yScale));

 let plot1title = plot1.append("text")
                       .attr("class", "plotTitle")
                       .attr("text-anchor", "middle")
                       .attr("x", plotWidth/2)
                       .attr("y", -titleOffset)
                       .text("Emissions vs. Calories per Serving of Food")
 let plot1xlab = plot1.append("text")
                       .attr("class", "axisLabel")
                       .attr("text-anchor", "middle")
                       .attr("x", plotWidth/2)
                       .attr("y", plotHeight + axisOffset)
                       .text("Calories per Serving")
 let plot1ylab = plot1.append("text")
                       .attr("transform", "rotate(-90)")
                       .attr("class", "axisLabel")
                       .attr("text-anchor", "middle")
                       .attr("x", -plotHeight/2)
                       .attr("y",-axisOffset)
                       .text("kg CO2 Equivalent per Serving")
 let innerPlotGroup1 = plot1.append('g');
 let outerPlotGroup1 = plot1.append('g');
 let ref1 = outerPlotGroup1.append("line")
                           .attr("class", "refLine")
                           .attr("width", plotWidth)
                           .attr("x1", 0)
                           .attr("x2", plotWidth)
                           .attr("y1", yScale(0.41))
                           .attr("y2", yScale(0.41))
 let ref1text = plot1.append("text")
                       .attr("class", "refAnnotation")
                       .attr("text-anchor", "end")
                       .attr("x", plotWidth)
                       .attr("y", yScale(0.41) - refAnnotationOffset)
                       .text("1 Mile Driven in Car")
   let ref2 = outerPlotGroup1.append("line")
                             .attr("class", "refLine")
                             .attr("width", plotWidth)
                             .attr("x1", 0)
                             .attr("x2", plotWidth)
                             .attr("y1", yScale(5*0.41))
                             .attr("y2", yScale(5*0.41))
   let ref2text = plot1.append("text")
                         .attr("class", "refAnnotation")
                         .attr("text-anchor", "end")
                         .attr("x", plotWidth)
                         .attr("y", yScale(5*0.41) - refAnnotationOffset)
                         .text("5 Miles Driven in Car")
 addCircles(csvData, innerPlotGroup1, "plot1AllCircles", xScale, yScale);

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
         .on("mouseover",	function(){var el = this;
                                     d3.select(this).moveToFront();
                                       return displayName(el, plot)
                                     })
         .on("mouseout", function(){var el = this;
                                     return undisplay(el, plot)
                                   })
 };

 // Highights circle with stroke and display tooltip
 function displayName (a, plot) {
   var xPos = a.cx.animVal.value;
   var yPos = a.cy.animVal.value;
   var name = d3.select(a).datum().name;
   var portion = d3.select(a).datum().portion_desc;
   var highlightedPoint = d3.select(a)
                            .attr("r", 4)
                            .style("stroke", "black")
                            .style("stroke-width", "2");
   plot.append("text")
                  .attr("x", xPos - 4)
                  .attr("y", yPos - 22)
                  .attr("class", "annotations")
                  .text(name);
  plot.append("text")
                 .attr("x", xPos - 4)
                 .attr("y", yPos - 8)
                 .attr("class", "annotations")
                 .text(portion);
 };

 // Undoes the highlighting from displayName (removes stroke and tooltip)
 function undisplay (a, plot) {
   d3.select(a)
     .attr("r", 2)
     .style("stroke-width", "0")
   plot.selectAll("text").remove();
 }

};

function createPlot2(csvData){
   let titleOffset = 10;
   let axisOffset = 35;
   let refAnnotationOffset = 2;
   let plotMargin = 100;
   let plotWidth = 500; //500;
   let plotHeight = 500; //500;
   let barWidth = 30;

   // Add an SVG element to the DOM
   var svg = d3.select('#plot2div').append('svg')
               .attr('width', plotWidth + plotMargin*2)
               .attr('height', plotHeight + plotMargin*2);
   let plot1 = svg.append('g')
                  .attr('transform', `translate(${plotMargin}, ${plotMargin})`);

let dataSortedByGHGE = csvData.sort(function(x, y){
   return d3.descending(x.ghge_portion, y.ghge_portion);
});
  const xScale = d3.scaleBand()
      .range([0, plotWidth])
      .domain(dataSortedByGHGE.map(function(d){ return d.name; }))
      .padding(0.2)
   let yScale = d3.scaleLinear()
                 .domain([0,3.5])
                 .range([plotHeight, 0]);

   let xAxis1 = plot1.append('g')
                   .attr('transform', `translate(0, ${plotHeight})`)
                   .call(d3.axisBottom(xScale));
   let yAxis1 = plot1.append('g')
                   .call(d3.axisLeft(yScale));
   let plot1title = plot1.append("text")
                         .attr("class", "plotTitle")
                         .attr("text-anchor", "middle")
                         .attr("x", plotWidth/2)
                         .attr("y", -titleOffset)
                         .text("Emissions vs. Calories per Serving of Food")
   let plot1xlab = plot1.append("text")
                         .attr("class", "axisLabel")
                         .attr("text-anchor", "middle")
                         .attr("x", plotWidth/2)
                         .attr("y", plotHeight + axisOffset)
                         .text("Calories per Serving")
   let plot1ylab = plot1.append("text")
                         .attr("transform", "rotate(-90)")
                         .attr("class", "axisLabel")
                         .attr("text-anchor", "middle")
                         .attr("x", -plotHeight/2)
                         .attr("y",-axisOffset)
                         .text("kg CO2 Equivalent per Serving")
   let innerPlotGroup1 = plot1.append('g');
   let outerPlotGroup1 = plot1.append('g');

   console.log()

   plot1.selectAll()
   .data(csvData.sort(function(x, y){
      return d3.ascending(x.ghge_portion, y.ghge_portion);
   }))
   .enter()
   .append('rect')
   .attr('x', function(d){ return xScale(d.name); })
   .attr('y', function (d) {return yScale(d.ghge_portion);}) //(s) => yScale(s.ghge_portion))
   .attr('height', function (d) {return plotHeight - yScale(d.ghge_portion);})
   .attr('width', xScale.bandwidth())
};

//////////////////////////////////////////////////////////////////////////
//Utility Functions
/////////////////////////////////////////////////////////////////////////

//Move element to front
//https://gist.github.com/trtg/3922684
  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };

// Filter data to only return data with a score above minimumScore
function filterNames(data, str) {
  console.log(str.toUpperCase())
    var filteredPoints = data.filter(function (d) {
      data.forEach(function(d) {
                         d.contains = d.name.toUpperCase().indexOf(str.toUpperCase());
                      })
        return d.contains > -1
    });
    return filteredPoints;
};

function sortByGHGE(data) {

}

//Search with dropdown autofill
//   //For dropdown code: https://bl.ocks.org/ProQuestionAsker/8382f70af7f4a7355827c6dc4ee8817d
//   var dropdown1 = d3.select("#dropdown1div")
//                     .append("input")
//                     .attr("type", "text")
//                     .attr("id", "myVal")
//                     .on("keyup", filterDropdown);
//
// //List example https://www.w3schools.com/howto/howto_js_filter_lists.asp
// var dropList = d3.select("#dropdown1div")
//                   .append("ul")
//                   .attr("class", "myUL")
//
//
//   function filterDropdown(){
//     substring = document.getElementById("myVal").value
//     data = filterNames(csvData, substring)
//     console.log(data)
//
//     var elements = dropList.selectAll("li")
//             .data(data)
//
//             elements.enter()
//             .append("li")
//             .text(function(d){return d.name;});
//
//             elements.exit().remove();
//
//     console.log(dropList.exit())
//   };
