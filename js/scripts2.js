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
   var csvData = loadedData
   csvData.forEach(function(d) {
                     if (d.fruit > 0) {d.color = color = "pink"
                     } else if (d.veg > 0) {d.color = color = "green"
                     } else if (d.dairy > 0) {d.color = color = "blue"
                     } else if (d.meat > 0) {d.color = color = "red"
                     } else if (d.grain > 0) {d.color = color = "brown"
                     } else if (d.oil> 0) {d.color = color = "yellow"
                     } else if (d.protein> 0) {d.color = color = "orange"
                     } else if (d.bevarage> 0) {d.color = color = "purple"
                     } else {d.color = "gray"}
                   })
   generateVis(csvData);
};

//Generate visualization using parsed data from CSV (array of objects)
function generateVis(csvData){
  let titleOffset = 10;
  let axisOffset = 35;
  let refAnnotationOffset = 2;
  let plotMargin1 = 100;
  let plotWidth1 = 300; //500;
  let plotHeight1 = 500; //500;

  var svg1 = d3.select('#plot1div').append('svg')
    .attr('width', plotWidth1 + plotMargin1*2)
    .attr('height', plotHeight1 + plotMargin1*2);

  let plot1 = svg1.append('g')
                 .attr('transform', `translate(${plotMargin1}, ${plotMargin1})`);
  let xScale = d3.scaleLinear()
                 .domain([0,400])
                 .range([0, plotWidth1]);
  let yScale = d3.scaleLinear()
                .domain([0,3.5])
                .range([plotHeight1, 0]);
  let xAxis1 = plot1.append('g')
                  .attr('transform', `translate(0, ${plotHeight1})`)
                  .call(d3.axisBottom(xScale));
  let yAxis1 = plot1.append('g')
                  .call(d3.axisLeft(yScale));

  let plot1title = plot1.append("text")
                        .attr("class", "plotTitle")
                        .attr("text-anchor", "middle")
                        .attr("x", plotWidth1/2)
                        .attr("y", -titleOffset)
                        .text("Emissions vs. Calories per Serving of Food")
  let plot1xlab = plot1.append("text")
                        .attr("class", "axisLabel")
                        .attr("text-anchor", "middle")
                        .attr("x", plotWidth1/2)
                        .attr("y", plotHeight1 + axisOffset)
                        .text("Calories per Serving")
  let plot1ylab = plot1.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("class", "axisLabel")
                        .attr("text-anchor", "middle")
                        .attr("x", -plotHeight1/2)
                        .attr("y",-axisOffset)
                        .text("kg CO2 Equivalent per Serving")
  let innerPlotGroup1 = plot1.append('g');
  let outerPlotGroup1 = plot1.append('g');
  let ref1 = outerPlotGroup1.append("line")
                            .attr("class", "refLine")
                            .attr("width", plotWidth1)
                            .attr("x1", 0)
                            .attr("x2", plotWidth1)
                            .attr("y1", yScale(0.41))
                            .attr("y2", yScale(0.41))
  let ref1text = plot1.append("text")
                        .attr("class", "refAnnotation")
                        .attr("text-anchor", "end")
                        .attr("x", plotWidth1)
                        .attr("y", yScale(0.41) - refAnnotationOffset)
                        .text("1 Mile Driven in Car")
    let ref2 = outerPlotGroup1.append("line")
                              .attr("class", "refLine")
                              .attr("width", plotWidth1)
                              .attr("x1", 0)
                              .attr("x2", plotWidth1)
                              .attr("y1", yScale(5*0.41))
                              .attr("y2", yScale(5*0.41))
    let ref2text = plot1.append("text")
                          .attr("class", "refAnnotation")
                          .attr("text-anchor", "end")
                          .attr("x", plotWidth1)
                          .attr("y", yScale(5*0.41) - refAnnotationOffset)
                          .text("5 Miles Driven in Car")

  let plotMargin2 = 100;
  let plotWidth2 = 800; //500;
  let plotHeight2 = 200; //500;
  let barWidth = 30;

  var categories = ["All Foods", "Fruits", "Vegetables", "Grains", "Dairy", "Protein", "Meat", "Beverage"];
  // Add an SVG element to the DOM

  var svg2 = d3.select('#plot2div').append('svg')
              .attr('width', plotWidth2 + plotMargin2*2)
              .attr('height', plotHeight2 + plotMargin2*2);

  let plot2 = svg2.append('g')
                 .attr('transform', `translate(${plotMargin2}, ${plotMargin2})`);

   let plot2title = plot2.append("text")
                         .attr("class", "plotTitle")
                         .attr("text-anchor", "middle")
                         .attr("x", plotWidth2/2)
                         .attr("y", -titleOffset)
                         .text("Emissions From Food Items")

   let plot2ylab = plot2.append("text")
                         .attr("transform", "rotate(-90)")
                         .attr("class", "axisLabel")
                         .attr("text-anchor", "middle")
                         .attr("x", -plotHeight2/2)
                         .attr("y",-axisOffset)
                         .text("kg CO2 Equivalent per Serving")
   let innerPlotGroup2 = plot2.append('g');
   let outerPlotGroup2 = plot2.append('g');

   let dataSortedByGHGE = csvData.sort(function(x, y){
      return d3.descending(x.ghge_portion, y.ghge_portion);
   });

   let xScale2 = d3.scaleBand()
       .range([0, plotWidth2])
       .domain([0,1])//domain(dataSortedByGHGE.map(function(d){ return d.name; }))
       .padding(0.2)

    let yScale2 = d3.scaleLinear()
                  .domain([0,3.5])
                  .range([plotHeight2, 0]);
    let x_axis2 = d3.axisBottom().scale(xScale2);
    let xAxis2 = plot2.append('g')
                     .attr("class", "xaxis")
                    .attr('transform', `translate(0, ${plotHeight2})`)
                    .call(x_axis2)
                    .selectAll("text")
                 .style("text-anchor", "end")
                 .attr("transform", "rotate(-90)");


    let yAxis2 = plot2.append('g')
                    .call(d3.axisLeft(yScale2));


  var dropdown = d3.select('#plot2dropdown').append("select")
                   .attr("class", "dropdown")
                   .attr("id", "dropdownCategory")
                   .on("change", function () {
                                 var cat = document.getElementById("dropdownCategory").value;
                                  var filteredData = filterByGroup(csvData, cat)
                                  return updateFoodGroup(filteredData, plot2);})


  addCircles(csvData, innerPlotGroup1, "plot1AllCircles", xScale, yScale);
  dropdown.selectAll("option")
                   .data(categories)
                   .enter()
                   .append("option")
                   .text(function(d){return d})

 plotDat(csvData, plot2)

  //Add circles to plot1
  function addCircles(filteredPoints, plot, circleClass, xScale, yScale) {
      var circles = plot.selectAll("circle")
                        .data(filteredPoints, function(d){return d.name})

     circles.enter().append("circle")
            .merge(circles)
            .attr("class", circleClass)
            .attr("fill", function(d) {return d.color;})
            .attr("cx", function (d) {return xScale(d.kcal_portion);})
            .attr("cy", function (d) {return yScale(d.ghge_portion);})
            .on("mouseover",	function(){var el = this;
                                        d3.select(this).moveToFront();
                                          return displayName(el, plot1)
                                        })
            .on("mouseout", function(){var el = this;
                                        return undisplay(el, plot1)
                                      })
     circles.exit().remove();


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
   plot.selectAll(".annotations").remove();
 }

function updateFoodGroup(filteredData, plot2) {
  plotDat(filteredData, plot2)
  updateCircleColors(filteredData)
}

function updateCircleColors(filteredData){
  var circles = plot1.selectAll("circle")
                    .data(filteredData, function(d){return d.name})
                    .attr("fill", function(d){return d.color})
                    .moveToFront()


                    circles.enter()
                    .attr("cx", function (d) {return xScale(d.kcal_portion);})
                    .attr("cy", function (d) {return yScale(d.ghge_portion);})
                            .attr("fill", function(d){return d.color})
                            .moveToFront()

                    circles.exit()
                    .attr("fill", "gray")

                    circles
                    .on("mouseover",	function(){var el = this;
                                                d3.select(this).moveToFront();
                                                  return displayName(el, plot1)
                                                })
                    .on("mouseout", function(){var el = this;
                                                return undisplay(el, plot1)
                                              })

  }
  function plotDat(csvData, plot2){

    dataSortedByGHGE = csvData.sort(function(x, y){
       return d3.descending(x.ghge_portion, y.ghge_portion);
    });

    xScale2.domain(dataSortedByGHGE.map(function(d){ return d.name; }))
    var xAxis = d3.axisBottom().scale(xScale2);
    plot2.selectAll(".xaxis")
        .transition()
        .call(x_axis2)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-0.5em")
          .attr("transform", "rotate(-65)");

     let bars = plot2.selectAll("rect")
     .data(dataSortedByGHGE, function(d){return d.name})
     .attr("fill", function(d){return d.color})
     .attr('x', function(d){ return xScale2(d.name); })
     .attr('y', function (d) {return yScale2(d.ghge_portion);}) //(s) => yScale(s.ghge_portion))
     .attr('height', function (d) {return plotHeight2 - yScale2(d.ghge_portion);})
     .attr('width', xScale2.bandwidth())


     bars.enter().append("rect")
     .attr("fill", function(d){return d.color})
     .attr('x', function(d){ return xScale2(d.name); })
     .attr('y', function (d) {return yScale2(d.ghge_portion);}) //(s) => yScale(s.ghge_portion))
     .attr('height', function (d) {return plotHeight2 - yScale2(d.ghge_portion);})
     .attr('width', xScale2.bandwidth());

     bars.exit().remove();

  }


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
    var filteredPoints = data.filter(function (d) {
      data.forEach(function(d) {
                         d.contains = d.name.toUpperCase().indexOf(str.toUpperCase());
                      })
        return d.contains > -1
    });
    return filteredPoints;
};

// Filter data to only return data with a score above minimumScore
function filterByGroup(data, cat) {
    var filteredPoints = data.filter(function (d) {
      if (cat.toUpperCase() == "FRUITS") {return d.fruit > 0
      } else if ( cat.toUpperCase() == "VEGETABLES") {return d.veg > 0
      } else if (cat.toUpperCase() == "DAIRY") {return d.dairy > 0
      } else if (cat.toUpperCase() == "MEAT") {return d.meat > 0
      } else if (cat.toUpperCase() == "PROTEIN") {return d.protein > 0
      } else if (cat.toUpperCase() == "BEVERAGE") {return d.beverage > 0
      } else if (cat.toUpperCase() == "GRAINS") {return d.grain > 0
      } else {return d}
    });
    return filteredPoints;
};

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
