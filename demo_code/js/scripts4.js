var bodyText = "The food industry is a major source of world greenhouse gas emissions (GHGE). " +
"According to a study by the IPCC, an estimated 10-12% of world GHGEs come from " +
"agriculture ignoring fuel use, fertilizers, and land changes, and accounting for these factors, "+
"the estimate grows to 30%. When it comes to enironmental imact, not all foods are created equal."+
"A recent study by researcher at the University of Michigan (Heller et. al, 2018)" +
"showed that just 20% of the population makes up for almost half of food related emissions in the "+
"US. It's no surprise that the blame isn't easily distributed, since there are several outlier foods "+
"that make up for a disproportionate amoount of emissions. Click through the food groups to learn more."
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
       carb_portion : +d.carbsPortion,
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
                     if (d.fruit > 0) {d.color = color = "#f781bf"
                   } else if (d.veg > 0) {d.color = color = "#4daf4a"
                     } else if (d.dairy > 0) {d.color = color = "#377eb8"
                     } else if (d.meat > 0) {d.color = color = "#e41a1c"
                   } else if (d.grain > 0) {d.color = color = "#a65628"
                     } else if (d.oil> 0) {d.color = color = "#ffff33"
                     } else if (d.protein> 0) {d.color = color = "#ff7f00"
                     } else if (d.bevarage> 0) {d.color = color = "#a65628"
                   } else {d.color = "#80b1d3"}
                   d.num_servings = 0;
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
  let plotHeight1 = 200; //500;
  let plotMargin2 = 100;
  let plotWidth2 = 500; //500;
  let plotHeight2 = plotHeight1; //500;

  var svg0 = d3.select('#intro').append('svg')
                .attr("width", 2000)
                .attr("height", 150)
  var txtGroup = svg0.append('g')

  // var intro = svg0.append("text")
  //                 .text(/text/intro.txt)
  var svg1 = d3.select('#plot1div').append('svg')
                .attr("width", 2000)
                .attr("height", 700)//"height", plotHeight1+2*plotMargin1)
    // .attr('width', plotWidth1 + plotMargin1*2)
    // .attr('height', plotHeight1 + plotMargin1*2);

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



  var categories = ["All Foods","Meat", "Protein", "Beverage" ,"Dairy","Fruits", "Vegetables", "Grains"];
  // Add an SVG element to the DOM

//   var svg2 = d3.select('#plot2div').append('svg')
//               .attr('width', plotWidth2 + plotMargin2*2)
//               .attr('height', plotHeight2 + plotMargin2*2);
// var tooldesc = svg2.append('g')
// tooldesc.append("text").text("hello").attr("class", "description")
  // let plot2 = svg2.append('g')
  //                .attr('transform', `translate(${plotMargin2}, ${plotMargin2})`);
  let plot2 = svg1.append('g')
                 .attr('transform', `translate(${plotMargin2+plotMargin1+plotWidth1}, ${plotMargin2})`);
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

    let y_axis2 = d3.axisLeft().scale(yScale2)
    let yAxis2 = plot2.append('g')
                    .attr("class", "yaxis")
                    .call(d3.axisLeft(yScale2));

  var dropdown = d3.select('#plot2dropdown').append("select")
                   .attr("class", "dropdown")
                   .attr("id", "dropdownCategory")
                   .on("change", function () {
                                 var cat = document.getElementById("dropdownCategory").value;
                                  var filteredData = filterByGroup(csvData, cat)
                                  return updateFoodGroup(filteredData, plot2);})

                                  addCircles(csvData, innerPlotGroup1, "plot1AllCircles", xScale, yScale);
                                  updateCircleColors(csvData)


    dropdown.selectAll("option")
                     .data(categories)
                     .enter()
                     .append("option")
                     .text(function(d){return d})

   plotDat(csvData, plot2, 1)
   updateFoodGroup(csvData, plot2)

///////////////////////////////////////////////

///////////////////////////////////////////////
  var plotWidth3 = 0.7*plotWidth2;//100
  var plotHeight3 = plotHeight2;//200
  var plotMargin3 = plotMargin1;
  var svg3 = d3.select('#plot3div').append('svg')
                .attr("width", 2000)
                .attr("height", plotHeight3+2*plotMargin1)
  let plot3 = svg3.append('g')
                 .attr('transform', `translate(${plotMargin3}, ${plotMargin3})`);
 let plot3title = plot3.append("text")
                         .attr("class", "plotTitle")
                         .attr("text-anchor", "middle")
                         .attr("x", plotWidth3/2)
                         .attr("y", -titleOffset)
                         .text("Emmisions in Food Items")
   let plot3ylab = plot3.append("text")
                         .attr("transform", "rotate(-90)")
                         .attr("class", "axisLabel")
                         .attr("text-anchor", "middle")
                         .attr("x", -plotHeight3/2)
                         .attr("y",-axisOffset)
                         .text("kg CO2 Equivalent per Serving")
   let innerPlotGroup3 = plot3.append('g');
   let outerPlotGroup3 = plot3.append('g');
   let xScale3 = d3.scaleLinear()
                  .domain([0,400])
                  .range([0, plotWidth3]);
   let yScale3 = d3.scaleLinear()
                 .domain([0,3.5])
                 .range([plotHeight3, 0]);
   let xAxis3 = plot3.append('g')
                   .attr('transform', `translate(0, ${plotHeight3})`)
                   .attr("class", "xaxis")
                   .call(d3.axisBottom(xScale3));
   let yAxis3 = plot3.append('g')
                    .attr("class", "yaxis")
                   .call(d3.axisLeft(yScale3));
   var dropdown3 = d3.select('#plot3dropdown').append("select")
                    .attr("class", "dropdown")
                    .attr("id", "dropdownCategory3")
                    .on("change", function () {
                                  var cat = document.getElementById("dropdownCategory3").value;
                                   var filteredData = filterByGroup(csvData, cat)
                                   return plotDat(filteredData, plot3, 0);})

   var svg6 = d3.select('#plot6div').append('svg')
                 .attr("width", 2000)
                 .attr("height", plotHeight3+2*plotMargin1)
   let plate = svg6.append('g')
   let plateList = plate.append("ul")
   let servings = [];
   let plateLabels = [];
   let plateX = plotMargin3//plotWidth3+plotMargin3*2;
   let plateY = 20//plotHeight3+100//20;

   dropdown3.selectAll("option")
                    .data(categories)
                    .enter()
                    .append("option")
                    .text(function(d){return d})
  plotDat(csvData, plot3, 0)



  ///////////////////////////////////////////////////////

  //////////////////////////////////////////////
    var plotWidth4 = 100
    var plotHeight4 = plotHeight2;//200
    var plotMargin4 = plotMargin1;
    // var svg3 = d3.select('#plot3div').append('svg')
    //               .attr("width", 2000)
    //               .attr("height", plotHeight3+2*plotMargin1)
    let plot4 = svg3.append('g')
                   .attr('transform', `translate(${2*plotMargin3+ 1.5*plotWidth3 - 50}, ${plotMargin3})`);
   // let plot4title = plot4.append("text")
   //                         .attr("class", "plotTitle")
   //                         .attr("text-anchor", "middle")
   //                         .attr("x", plotWidth4/2)
   //                         .attr("y", -titleOffset)
   //                         .text("Total Emissions")
     let plot4ylab = plot4.append("text")
                           .attr("transform", "rotate(-90)")
                           .attr("class", "axisLabel")
                           .attr("text-anchor", "middle")
                           .attr("x", -plotHeight4/2)
                           .attr("y",-axisOffset)
                           .text("kg CO2 Equivalent")
   let plot4xlab = plot4.append("text")
                         .attr("class", "axisLabel")
                         .attr("text-anchor", "middle")
                         .attr("x", plotWidth4/2)
                         .attr("y", plotHeight4 + axisOffset)
                         .text("Total Emissions")
     let innerPlotGroup4 = plot4.append('g');
     let outerPlotGroup4 = plot4.append('g');
     let xScale4 = d3.scaleLinear()
                    .domain([0,1])
                    .range([0, plotWidth4]);

    let q1 = 1.94;
    let med = 2.8;
    let q5 = 6.91;
     let yScale4 = d3.scaleLinear()
                   .domain([0,q5+0.01*q5])
                   .range([plotHeight4, 0]);
     // let xAxis4 = plot4.append('g')
     //                 .attr('transform', `translate(0, ${plotHeight4})`)
     //                 .attr("class", "xaxis")
                     // .call(d3.axisBottom(xScale4));
    let xAxis4 = plot4.append("line")
                      .attr("class", "refLine")
                      .attr("x1", 0)
                      .attr("x2", plotWidth4)
                      .attr("y1", plotHeight4)
                      .attr("y2", plotHeight4)
     let yAxis4 = plot4.append('g')
                     .call(d3.axisLeft(yScale4));


     let runnover = 50;
     let q1_ref = plot4.append("line")
                               .attr("class", "refLine")
                               .attr("width", plotWidth4+runnover)
                               .attr("x1", 0)
                               .attr("x2", plotWidth4+runnover)
                               .attr("y1", yScale4(q1))
                               .attr("y2", yScale4(q1))
     let q1_txt = plot4.append("text")
                           .attr("class", "refAnnotation")
                           .attr("text-anchor", "end")
                           .attr("x", plotWidth4+runnover)
                           .attr("y", yScale4(q1) - refAnnotationOffset)
                           .text("1st Quintile")
   let med_ref = plot4.append("line")
                             .attr("class", "refLine")
                             .attr("width", plotWidth4+runnover)
                             .attr("x1", 0)
                             .attr("x2", plotWidth4+runnover)
                             .attr("y1", yScale4(med))
                             .attr("y2", yScale4(med))
   let med_txt = plot4.append("text")
                         .attr("class", "refAnnotation")
                         .attr("text-anchor", "end")
                         .attr("x", plotWidth4+runnover)
                         .attr("y", yScale4(med) - refAnnotationOffset)
                         .text("Median")
   let q5_ref = plot4.append("line")
                             .attr("class", "refLine")
                             .attr("width", plotWidth4+runnover)
                             .attr("x1", 0)
                             .attr("x2", plotWidth4+runnover)
                             .attr("y1", yScale4(q5))
                             .attr("y2", yScale4(q5))
   let q5_txt = plot4.append("text")
                         .attr("class", "refAnnotation")
                         .attr("text-anchor", "end")
                         .attr("x", plotWidth4+runnover)
                         .attr("y", yScale4(q5) - refAnnotationOffset)
                         .text("5th Quintile")

    ///////////////////////////////////////////////////////

    //////////////////////////////////////////////
      var plotWidth5 = 200
      var barMargin = 2
      let barWidth = plotWidth5/4 - barMargin*8;
      var plotHeight5 = plotHeight2;//200
      var plotMargin5 = plotMargin1;
      // var svg3 = d3.select('#plot3div').append('svg')
      //               .attr("width", 2000)
      //               .attr("height", plotHeight3+2*plotMargin1)
      let plot5 = svg3.append('g')
                     .attr('transform', `translate(${plotWidth3 + plotWidth4 + 450}, ${plotMargin3})`);
     // let plot4title = plot4.append("text")
     //                         .attr("class", "plotTitle")
     //                         .attr("text-anchor", "middle")
     //                         .attr("x", plotWidth4/2)
     //                         .attr("y", -titleOffset)
     //                         .text("Total Emissions")
       let plot5ylab = plot5.append("text")
                             .attr("transform", "rotate(-90)")
                             .attr("class", "axisLabel")
                             .attr("text-anchor", "middle")
                             .attr("x", -plotHeight4/2)
                             .attr("y",-axisOffset)
                             .text("% Daily Value")
     // let plot5xlab = plot4.append("text")
     //                       .attr("class", "axisLabel")
     //                       .attr("text-anchor", "middle")
     //                       .attr("x", plotWidth4/2)
     //                       .attr("y", plotHeight4 + axisOffset)
     //                       .text("Total Emissions")

      let nut_cats = [{name: "Calories"},
      {name: "Fat"}, {name: "Protein"}, {name: "Carbs"}];//Calories", "Fat", "Protein", "Carbohydrates"]
      console.log(nut_cats.map(function(d){ return d.name; }))
       // let xScale5 = d3.scaleLinear()
       //                .domain(nut_cats.map(function(d){ return d; }))
       //                .range([0, plotWidth4]);
       //
       //                // let xAxis5 = plot5.append('g')
       //                //                 .call(d3.axisBottom(xScale5));
       //                let x_axis5 = d3.axisBottom().scale(xScale5);
       //                let xAxis5 = plot5.append('g')
       //                                 .attr("class", "xaxis")
       //                                .attr('transform', `translate(0, ${plotHeight5})`)
       //                                .call(x_axis5)
       //                                .selectAll("text")
       //                             .style("text-anchor", "end")
       //                             .attr("transform", "rotate(-90)");
       let yScale5 = d3.scaleLinear()
                     .domain([0,150])
                     .range([plotHeight4, 0]);


       // let xAxis4 = plot4.append('g')
       //                 .attr('transform', `translate(0, ${plotHeight4})`)
       //                 .attr("class", "xaxis")
                       // .call(d3.axisBottom(xScale4));

      let xAxis5 = plot5.append("line")
                        .attr("class", "refLine")
                        .attr("x1", 0)
                        .attr("x2", plotWidth5)
                        .attr("y1", plotHeight5)
                        .attr("y2", plotHeight5)
      plot5.append("text")
                        .attr("y", plotHeight5+20)
                        .attr("class", "ticks")
                        .text("KCal")

                        plot5.append("text")
                        .attr("x", barWidth+2*barMargin+5)
                        .attr("y", plotHeight5+20)
                        .attr("class", "ticks")
                        .text("Fat")

                        plot5.append("text")
                        .attr("x", 2*(barWidth+2*barMargin) - 2)
                        .attr("y", plotHeight5+20)
                        .attr("class", "ticks")
                        .text("Protein")

                        plot5.append("text")
                        .attr("x", 3*(barWidth+2*barMargin)+5)
                        .attr("y", plotHeight5+20)
                        .attr("class", "ticks")
                        .text("Carbs")

       let yAxis5 = plot5.append('g')
                       .call(d3.axisLeft(yScale5));


       let dv_ref = plot5.append("line")
                                 .attr("class", "refLine")
                                 .attr("width", plotWidth5)
                                 .attr("x1", 0)
                                 .attr("x2", plotWidth5)
                                 .attr("y1", yScale5(100))
                                 .attr("y2", yScale5(100))
       let dv_txt = plot5.append("text")
                             .attr("class", "refAnnotation")
                             .attr("text-anchor", "end")
                             .attr("x", plotWidth5)
                             .attr("y", yScale5(100) - refAnnotationOffset)
                             .text("100%")
      ///////////////////////////////////////////////////////
     //  var plotWidth3 = plotWidth2;//100
     //  var plotHeight3 = plotHeight2;//200
     //  var plotMargin3 = plotMargin1;
     //  var svg3 = d3.select('#plot3div').append('svg')
     //                .attr("width", 2000)
     //                .attr("height", plotHeight3+2*plotMargin1)
     //  let plot3 = svg3.append('g')
     //                 .attr('transform', `translate(${plotMargin3}, ${plotMargin3})`);
     // let plot3title = plot3.append("text")
     //                         .attr("class", "plotTitle")
     //                         .attr("text-anchor", "middle")
     //                         .attr("x", plotWidth3/2)
     //                         .attr("y", -titleOffset)
     //                         .text("Emmisions in Food Items")
     //   let plot3ylab = plot3.append("text")
     //                         .attr("transform", "rotate(-90)")
     //                         .attr("class", "axisLabel")
     //                         .attr("text-anchor", "middle")
     //                         .attr("x", -plotHeight3/2)
     //                         .attr("y",-axisOffset)
     //                         .text("kg CO2 Equivalent per Serving")
     //   let innerPlotGroup3 = plot3.append('g');
     //   let outerPlotGroup3 = plot3.append('g');
     //   let xScale3 = d3.scaleLinear()
     //                  .domain([0,400])
     //                  .range([0, plotWidth3]);
     //   let yScale3 = d3.scaleLinear()
     //                 .domain([0,3.5])
     //                 .range([plotHeight3, 0]);
     //   let xAxis3 = plot3.append('g')
     //                   .attr('transform', `translate(0, ${plotHeight3})`)
     //                   .attr("class", "xaxis")
     //                   .call(d3.axisBottom(xScale3));
     //   let yAxis3 = plot3.append('g')
     //                    .attr("class", "yaxis")
     //                   .call(d3.axisLeft(yScale3));
     //   var dropdown3 = d3.select('#plot3dropdown').append("select")
     //                    .attr("class", "dropdown")
     //                    .attr("id", "dropdownCategory3")
     //                    .on("change", function () {
     //                                  var cat = document.getElementById("dropdownCategory3").value;
     //                                   var filteredData = filterByGroup(csvData, cat)
     //                                   return plotDat(filteredData, plot3, 0);})
     //
     //   let plate = svg3.append('g')
     //   let plateList = plate.append("ul")
     //   let servings = [];
     //   let plateLabels = [];
     //   let plateX = 500;
     //   let plateY = 20;
     //
     //   dropdown3.selectAll("option")
     //                    .data(categories)
     //                    .enter()
     //                    .append("option")
     //                    .text(function(d){return d})
     //  plotDat(csvData, plot3, 0)

      ////////////////////////////////////////////////

updateText(bodyText)

function updateText(words){




  // var words = txtGroup.append("text")
  //                     .attr("x", 20)
  //                     .attr("y", 20)
  //                     .text(intro)

 var words = d3.select("#intro").selectAll("p")
                .text(words)
  // svg0.selectAll("text").append("text")
  //     .attr("class", "description")
  //     .text(intro)
      //  .data(intro)
      // .enter
}
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
     circles.exit().remove();


  };

function addToPlate(a) {
  var name = d3.select(a).datum().name;
  // console.log(csvData)
  csvData = addServing(csvData, name)
  // console.log(csvData)
  var filteredPoints = filterByServings(csvData)
  var dataPoint = filterByName(csvData, name);

  var yPos = plateY + 15*filteredPoints.length;

  var items = plate.selectAll("text")
                   .data(filteredPoints, function(d){return d.name})
                   .attr("class", "plateText")
                   .text(function(d){return d.num_servings + "X " + d.name + ", " + d.portion_desc})
                   .on("click", function(d){removeServing(csvData, d3.select(this).datum().name)
                                              filteredData = filterByServings(csvData)
                                              if (d3.select(this).datum().num_servings == 0){
                                              d3.select(this).remove();}
                                              else {plate.selectAll("text")
                                                               .data(filteredData, function(d){return d.name})
                                                               .attr("class", "plateText")
                                                               .text(function(d){return d.num_servings + "X " + d.name + ", " + d.portion_desc})}
                                              updateBars()})
                   // .on("click", function(d){  d3.select(this).moveToFront();})

                   items.enter()
                   .append("text")
                   .attr("class", "plateText")
                   .attr("x", plateX)
                   .attr("y", yPos)
                   .text(function(d){return d.num_servings + "X " + d.name + ", " + d.portion_desc})
                   .on("click", function(d){  d3.select(this).remove();
                                              removeServing(csvData, d3.select(this).datum().name)
                                              filteredData = filterByServings(csvData)
                                              updateBars()})
                   // .on("click", function(d){  d3.select(this).moveToFront();})
  // console.log(dat)

  console.log(filteredPoints)
  // console.log(yScale5(nut_dat.kcal))

updateBars()

function updateBars (){
  var nut_dat = namearray(filteredPoints)
  var bars4 = plot4.selectAll("rect")
                  .data(nut_dat)
                  .attr("x", xScale4(0.5) - 0.5*barWidth)
                  .attr('y', function (d) {return yScale4(d.ghge);}) //(s) => yScale(s.ghge_portion))
                  .attr('height', function (d) {return plotHeight4 - yScale4(d.ghge);})
                  .attr("width", barWidth)
                  .attr("fill", function(d){if (d.ghge > med){ return "red"} else {return "black"}})

      bars4
      .enter().append("rect")
      .attr("x", xScale4(0.5) - 0.5*barWidth)
      .attr('y', function (d) {return yScale4(d.ghge);}) //(s) => yScale(s.ghge_portion))
      .attr('height', function (d) {return plotHeight4 - yScale4(d.ghge);})
      .attr("width", barWidth)
      .attr("fill", function(d){if (d.ghge > med){ return "red"} else {return "black"}})

      var kcalBars = plot5.selectAll(".kcal")
                      .data(nut_dat)
                      .attr("class", "kcal")
                      .attr("x", barMargin)//xScale5(0.25) - 0.5*(barWidth+2*barMargin))
                      .attr('y', function (d) {return yScale5(d.kcal);}) //(s) => yScale(s.ghge_portion))
                      .attr('height', function (d) {return plotHeight5 - yScale5(d.kcal);})
                      .attr("width", barWidth)
                      .attr("fill", function(d){if (d.kcal > 100){ return "red"} else {return "black"}})
                      // .on("mouseover",	function(){}})
          kcalBars
          .enter().append("rect")
          .attr("class", "kcal")
          .attr("x", barMargin)//xScale5(0.25) - 0.5*(barWidth+2*barMargin))
          .attr('y', function (d) {return yScale5(d.kcal);}) //(s) => yScale(s.ghge_portion))
          .attr('height', function (d) {return plotHeight5 - yScale5(d.kcal);})
          .attr("width", barWidth)
          .attr("fill", function(d){if (d.kcal > 100){ return "red"} else {return "black"}})

          var fatBars = plot5.selectAll(".fat")
                          .data(nut_dat)
                          .attr("class", "fat")
                          .attr("x", 2*barMargin+barWidth)//xScale5(0.5) - 0.5*(barWidth+2*barMargin))
                          .attr('y', function (d) {return yScale5(d.fat);}) //(s) => yScale(s.ghge_portion))
                          .attr('height', function (d) {return plotHeight5 - yScale5(d.fat);})
                          .attr("width", barWidth)
                          .attr("fill", function(d){if (d.fat > 100){ return "red"} else {return "black"}})


              fatBars
              .enter().append("rect")
              .attr("class", "fat")
              .attr("x", 2*barMargin+barWidth)//xScale5(0.5) - 0.5*(barWidth+2*barMargin))
              .attr('y', function (d) {return yScale5(d.fat);}) //(s) => yScale(s.ghge_portion))
              .attr('height', function (d) {return plotHeight5 - yScale5(d.fat);})
              .attr("width", barWidth)
              .attr("fill", function(d){if (d.fat > 100){ return "red"} else {return "black"}})

  var proteinBars = plot5.selectAll(".protein")
                  .data(nut_dat)
                  .attr("class", "protein")
                  .attr("x", 4*barMargin+2*barWidth)//xScale5(0.75) - 0.5*(barWidth+2*barMargin))
                  .attr('y', function (d) {return yScale5(d.protein);}) //(s) => yScale(s.ghge_portion))
                  .attr('height', function (d) {return plotHeight5 - yScale5(d.protein);})
                  .attr("width", barWidth)
                  .attr("fill", function(d){if (d.protein > 100){ return "red"} else {return "black"}})


      proteinBars
      .enter().append("rect")
      .attr("class", "protein")
      .attr("x", 4*barMargin+2*barWidth)//xScale5(0.75) - 0.5*(barWidth+2*barMargin))
      .attr('y', function (d) {return yScale5(d.protein);}) //(s) => yScale(s.ghge_portion))
      .attr('height', function (d) {return plotHeight5 - yScale5(d.protein);})
      .attr("width", barWidth)
      .attr("fill", function(d){if (d.protein > 100){ return "red"} else {return "black"}})

      var carbBars = plot5.selectAll(".carb")
                      .data(nut_dat)
                      .attr("class", "carb")
                      .attr("x", 6*barMargin+3*barWidth)//xScale5(1) - 0.5*(barWidth+2*barMargin))
                      .attr('y', function (d) {return yScale5(d.carb);}) //(s) => yScale(s.ghge_portion))
                      .attr('height', function (d) {return plotHeight5 - yScale5(d.carb);})
                      .attr("width", barWidth)
                      .attr("fill", function(d){if (d.carb > 100){ return "red"} else {return "black"}})


          carbBars
          .enter().append("rect")
          .attr("class", "carb")
          .attr("x", 6*barMargin+3*barWidth)//xScale5(1) - 0.5*(barWidth+2*barMargin))
          .attr('y', function (d) {return yScale5(d.carb);}) //(s) => yScale(s.ghge_portion))
          .attr('height', function (d) {return plotHeight5 - yScale5(d.carb);})
          .attr("width", barWidth)
          .attr("fill", function(d){if (d.carb > 100){ return "red"} else {return "black"}})
}

  function namearray(dat){
    out = {ghge: 0,
           kcal: 0,
           fat: 0,
           protein: 0,
           carb: 0};
    dat.forEach(function(d){
      out.ghge += d.num_servings*d.ghge_portion //push(d.name)
      out.kcal += 100*d.num_servings*d.kcal_portion/2000
      out.fat += 100*d.num_servings*d.fat_portion/70
      out.protein += 100*d.num_servings*d.protein_portion/50
      out.carb += 100*d.num_servings*d.carb_portion/320
    })
    return [out];
  }

  // var items = plateList.selectAll("li")
  //                      .data(dataPoint)
  //                      .enter()
  //                      .append("li")
  //                      .text(function(d){return d.name;});
}
  // function addToPlate(a) {
  // // csvData.forEach(function(d){console.log(d.name)})
  //   // plate.selectAll("text").data().forEach(function(d){console.log(d.name)})
  //   plateY = plateY + 15
  //   var portion = d3.select(a).datum().portion_desc;
  //
  //
  //   // console.log(servings.toString() + "X " + plateItems)
  //   // var plateStuff = [servings.toString() + "X " + plateItems]; //{names: plateItems, servings: servings.toString()}
  //   // plateStuff.names = plateItems
  //   // plateStuff.servings = servings.toString()
  //   var name = d3.select(a).datum().name;
  //   var dataPoint = filterByName(csvData, name);
  //   var dat = plate.selectAll("text").data();
  //
  //   var plateItems = namearray(dat);
  //   var ind = plateItems.indexOf(item)
  //   if (ind < 0){
  //     servings.push(1)
  //   } else {
  //     servings[ind] = servings[ind] + 1
  //     plateLabels[ind] = servings[ind].toString() + "X " + plateItems[ind]
  //   }
  //
  //   console.log(namearray(dat))
  //   var items = plate.selectAll("text")
  //        .data(dataPoint, function(d){return d.name})
  //        // .attr("x", plateX)
  //        // .attr("y", plateY)
  //        // .text(function(d){return d.name})
  //
  //        items.enter()
  //        .append("text")
  //        .attr("x", plateX)
  //        .attr("y", plateY)
  //        .text(function(d){return d.name})
  //
  //        // items.enter()
  //        // .append("text")
  //        // .attr("x", plateX)
  //        // .attr("y", plateY)
  //        // .text(function(d){return d.name})
  //       function namearray(dat){
  //         out = [];
  //         dat.forEach(function(d){
  //           out.push(d.name)
  //         })
  //         return out;
  //       }
  // }

  function tooltip(a, plot, plot2, updateScatter){
    //   if (stage == 0) {
      if (updateScatter > 0){
      displayName(a, plot);
    }

      highlightBar(a, plot2);
  }

  // Highights circle with stroke and display tooltip
  function displayName (a, plot) {
    // var xPos = a.cx.animVal.value;
    // var yPos = a.cy.animVal.value;
    var xPos = xScale(d3.select(a).datum().kcal_portion);
    var yPos = yScale(d3.select(a).datum().ghge_portion);
    var name = d3.select(a).datum().name;
    var dataPoint = filterByName(csvData, name);
    var portion = d3.select(a).datum().portion_desc;
    // var highlightedPoint = d3.select(a)
    //                          .attr("r", 4)
    //                          .style("stroke", "black")
    //                          .style("stroke-width", "2");

   c = plot1.selectAll("circle")
             .data(dataPoint, function(d){return d.name})
             .attr("class", "highlight")
             .style("stroke", "black")
             .style("stroke-width", "2");
             c.enter()
             .attr("class", "highlight")
             .attr("r", 4)
             .style("stroke", "black")
             .style("stroke-width", "2");

             c.exit()
             .attr("r", 4)
             .style("opacity", 0.4)

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

 function highlightBar(a, plot){
   var xPos2 = xScale2(d3.select(a).datum().name);
   var yPos2 = yScale2(d3.select(a).datum().ghge_portion);
   var name = d3.select(a).datum().name;
   var dataPoint = filterByName(csvData, name);
   var portion = d3.select(a).datum().portion_desc;
   var b = plot.selectAll("rect")
                  .data(dataPoint, function(d){return d.name})
                  .attr("class", "highlight")
                  .style("stroke", "black")
                  .style("stroke-width", "1");
      b.enter()
      .attr("class", "highlight")
      .style("stroke", "black")
      .style("stroke-width", "1");
      b.exit()
        .style("opacity", 0.4)

      plot.append("text")
                     .attr("x", xPos2 - 4)
                     .attr("y", yPos2 - 22)
                     .attr("class", "annotations")
                     .text(name);
     plot.append("text")
                    .attr("x", xPos2 - 4)
                    .attr("y", yPos2 - 8)
                    .attr("class", "annotations")
                    .text(portion);
  }

 // Undoes the highlighting from displayName (removes stroke and tooltip)
 function undisplay (a, plot1, plot2) {
   // var col = d3.select(a).datum().color
   // d3.select(a)
   //   .attr("r", 2)
   //   .style("stroke-width", "0")
   var bar = plot2.selectAll(".highlight")
                  .style("stroke-width", "0")

  var pt = plot1.selectAll(".highlight")
                 .attr("class", "plot1AllCircles")
              // .attr("fill", col)//.remove();
   plot2.selectAll("rect")
        .style("opacity", 1)

        plot1.selectAll("circle")
              .attr("class", "plot1AllCircles")
              .style("stroke-width", 0)
             .style("opacity", 1)
   plot1.selectAll(".annotations").remove();
   plot2.selectAll(".annotations").remove();
 }

function updateFoodGroup(filteredData, plot) {
  plotDat(filteredData, plot, 1)
  updateCircleColors(filteredData)
  updateText(bodyText)
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
                                                if (d3.select(this).attr("fill") !== "gray"){
                                                d3.select(this).moveToFront();
                                                return tooltip(el, plot1, plot2, 1)
                                                  // return displayName(el, plot1)
                                                }})
                    .on("mouseout", function(){var el = this;
                                                return undisplay(el, plot1, plot2)
                                              })

  }
  function plotDat(csvData, plot2, updateScatter){

    dataSortedByGHGE = csvData.sort(function(x, y){
       return d3.descending(x.ghge_portion, y.ghge_portion);
    });

    xScale2.domain(dataSortedByGHGE.map(function(d){ return d.name; }))
    var xAxis = d3.axisBottom().scale(xScale2);
    plot2.selectAll(".xaxis")
        // .transition()
        .call(x_axis2)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-0.5em")
          .attr("transform", "rotate(-65)");

  var maxY = d3.max(dataSortedByGHGE, function (d) { return d.ghge_portion; });
  yScale2.domain([0, maxY + 0.05*maxY])
  let y_axis2 = d3.axisLeft().scale(yScale2)
  plot2.selectAll(".yaxis")
      .transition()
      .call(y_axis2)


     let bars = plot2.selectAll("rect")
     .data(dataSortedByGHGE, function(d){return d.name})
     .attr("fill", function(d){return d.color})
     .attr('x', function(d){ return xScale2(d.name); })
     .attr('y', function (d) {return yScale2(d.ghge_portion);}) //(s) => yScale(s.ghge_portion))
     .attr('height', function (d) {return plotHeight2 - yScale2(d.ghge_portion);})
     .attr('width', xScale2.bandwidth())
     .on("mouseover",	function(){var el = this;
                                  return tooltip(el, plot1, plot2, updateScatter)})
                                  // return highlightBar(el)})
     .on("mouseout", function(){var el = this;
                                 return undisplay(el, plot1, plot2)
                               })
      .on("click", function(){var el = this;
                                   return addToPlate(el)})


     bars.enter().append("rect")
     .attr("fill", function(d){return d.color})
     .attr('x', function(d){ return xScale2(d.name); })
     .attr('y', function (d) {return yScale2(d.ghge_portion);}) //(s) => yScale(s.ghge_portion))
     .attr('height', function (d) {return plotHeight2 - yScale2(d.ghge_portion);})
     .attr('width', xScale2.bandwidth())
     .on("mouseover",	function(){var el = this;
                                  return tooltip(el, plot1, plot2, updateScatter)})
     .on("mouseout", function(){var el = this;
                                 return undisplay(el, plot1, plot2)
                               })
     .on("click", function(){var el = this;
                                  return addToPlate(el)})

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

function filterByServings(data) {
    var filteredPoints = data.filter(function (d) {
      return d.num_servings > 0
    });
    return filteredPoints;
};

function addServing(data, name) {
  data.forEach(function(d){
    if (d.name.toUpperCase() == name.toUpperCase()) {
      d.num_servings = d.num_servings + 1;
    }
  })
  return data;
}

function removeServing(data, name) {
  data.forEach(function(d){
    if (d.name.toUpperCase() == name.toUpperCase()) {
      d.num_servings = d.num_servings - 1;
    }
  })
  return data;
}

// Filter data to only return data with a score above minimumScore
function filterByGroup(data, cat) {
    var filteredPoints = data.filter(function (d) {
      if (cat.toUpperCase() == "FRUITS") {
        bodyText = "When it comes to fruits, there are a few outliers that are "+
        "much more carbon intensive than alternatives. Choose apples or oranges "+
        "instead of guava or watermelon."
        return d.fruit > 0
      } else if ( cat.toUpperCase() == "VEGETABLES") {
        bodyText = "Like the fruits, vegegables are relatively low on emissions "+
        "already. Leafy greens are the best option for a low-carbon diet."
        return d.veg > 0
      } else if (cat.toUpperCase() == "DAIRY") {
        bodyText = "While dairy products aren't as carbon intensive as meats, " +
        "GHGE from dairy can still add up fast. A serving of milk, cheese, or yogurt "+
        "equates to almost 1 mile of driving in an average car."
        return d.dairy > 0
      } else if (cat.toUpperCase() == "MEAT") {
        bodyText = "Meats are the largest contributer to greenhouse gas emissions. " +
        "Just a single serving of lamb, beef, or crustacean (e.g. lobster, shrimp) is "+
        "the GHGE equivalent of driving over 5 miles in an average car today. "
        "Fortunately, there is a wide spread in the amount of GHGE per serving between "+
        "different options. Choose turkey instead of beef, and you cut your emissions by almost "+
        "a factor of 10."
      return d.meat > 0
      } else if (cat.toUpperCase() == "PROTEIN") {
        bodyText = "Looking beyond meats to other sources of protein means "+
        "tremendous opportunity to cut down on GHGE. Plant based proteins like "+
        "nuts and beans are generally much lower in emissions than meats."

        return d.protein > 0
      } else if (cat.toUpperCase() == "BEVERAGE") {
        bodyText = "Beverages are relatively high in emissions compared to other "+
        "food groups. Choose water, coffee, or tea instead of highly processed "
        +"fruit juices or milk if you want to lower your carbon impact."
        return d.beverage > 0
      } else if (cat.toUpperCase() == "GRAINS") {
        bodyText = "Grains are very low on emissions compared to their calorie density. "+
        "These probably won't be the make or break in your diet choices with respect to emissions."
        return d.grain > 0
      } else {
        bodyText = "The food industry is a major source of world greenhouse gas emissions (GHGE). " +
        "According to a study by the IPCC, an estimated 10-12% of world GHGEs come from " +
        "agriculture ignoring fuel use, fertilizers, and land changes, and accounting for these factors, "+
        "the estimate grows to 30%. When it comes to enironmental imact, not all foods are created equal."+
        "A recent study by researcher at the University of Michigan (Heller et. al, 2018)" +
        "showed that just 20% of the population makes up for almost half of food related emissions in the "+
        "US. It's no surprise that the blame isn't easily distributed, since there are several outlier foods "+
        "that make up for a disproportionate amoount of emissions. Click through the food groups to learn more."
        return d}
    });
    return filteredPoints;
};

// Filter data to only return data with a score above minimumScore
function filterByName(data, name) {
    var filteredPoints = data.filter(function (d) {
      return d.name.toUpperCase() == name.toUpperCase()
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
