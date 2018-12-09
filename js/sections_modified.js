//BUGS TO WORK OUT:
// scrolling fast leaves certain elements shown
// when mouseover scatter pt, unstable sometimes
// axes visible at wrong times


/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function () {
  // constants to define the size
  // and margins of the vis area.
  var width = 650;
  var height = window.innerHeight - 100//500;//700;//800;//520;
  var margin = { top: 30, left: 100, bottom: 50, right: 70 }; // Changes margin between vis and other things
  var margin_between_plots = 100;
  var height_top = height/2 - margin_between_plots/2;
  var height_bot = height_top;
  var inactive_opac = 0.2;


  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;
  var dietPlanner = 0;

  // Sizing for the grid visualization
  var squareSize = 6;
  var squarePad = 2;
  var numPerRow = width / (squareSize + squarePad);

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  var xBarScale = d3.scaleBand()
    .range([0, width])
    .padding(0.2);

  var yBarScale = d3.scaleLinear()
    .range([height_top, 0]);

  var xBarScale_Meat = d3.scaleBand()
    .range([0, width])
    .padding(1);

  var xScatterScale = d3.scaleLinear()
    .range([0, width]);

  var yScatterScale = d3.scaleLinear()
    .range([height_top, 0]);

  var yDietScale = d3.scaleLinear()
    .range([0, height_top]);


  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function (selection) {
    selection.each(function (rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data([rawData]);

      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);


      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');



      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // // // // perform some preprocessing on raw data
      // var wordData = getWords(rawData);

      dataSortedByGHGE = sortDataByGHGE(rawData);
      var maxY = d3.max(dataSortedByGHGE, function (d) { return d.ghge_portion; });
      yBarScale.domain([0, maxY + 0.05*maxY])
      yScatterScale.domain([0, maxY + 0.05*maxY])
      yDietScale.domain([0, 10*maxY + 0.05*(10*maxY)])

      xBarScale.domain(dataSortedByGHGE.map(function(d){ return d.name; }))

      var maxKcal = d3.max(dataSortedByGHGE, function (d) { return d.kcal_portion; });
      xScatterScale.domain([0, maxKcal + 0.05*maxKcal])

      setupVis(dataSortedByGHGE);//(wordData, fillerCounts, histData);

      setupSections(dataSortedByGHGE);
    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  var setupVis = function (dataSortedByGHGE){//wordData, fillerCounts, histData) {

    var svg_dp = d3.select('#diet_planner_section').selectAll('svg').data([dataSortedByGHGE]);
    var svg_dpE = svg_dp.enter().append('svg')
    svg_dp = svg_dp.merge(svg_dpE)

    svg_dp.attr('width', 350);
    svg_dp.attr('height', 1000);

    svg_dp.append('g')

    g_dp = svg_dp.select('g')
    .attr('transform', `translate(0, ${0, 50})`)

    // g_dp.append('rect')
    //   .attr('x', 0)
    //   .attr('y', 0)
    //   .attr('width', 200)
    //   .attr('height', 200)

    g.append('g')
      .attr('transform', `translate(0, ${height_top})`)
      .attr("class", "xaxis_bar")
      .attr('opacity', 0)

    g.append('g')
      .attr("class", "yaxis_bar")
      .attr('opacity', 0)

    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr("class", "xaxis_scatter")
      .attr('opacity', 0)

    g.append('g')
      .attr('transform', `translate(0, ${height_top + margin_between_plots})`)
      .attr("class", "yaxis_scatter")
      .attr('opacity', 0)

    // count openvis title
    g.append('text')
      .attr('class', 'title openvis-title')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('2013');

    g.append('text')
      .attr('class', 'sub-title openvis-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text('OpenVis Conf');

    g.selectAll('.openvis-title')
      .attr('opacity', 0);

    // count filler word count title
    g.append('text')
      .attr('class', 'title count-title highlight')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('180');

    g.append('text')
      .attr('class', 'sub-title count-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text('Filler Words');

    g.selectAll('.count-title')
      .attr('opacity', 0);

  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  var setupSections = function (dataSortedByGHGE) {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showFillerTitle;
    activateFunctions[1] = showGrid;
    activateFunctions[2] = showCalories;
    activateFunctions[3] = highlightMeats;//showMeats;
    activateFunctions[4] = showMeats;
    activateFunctions[5] = highlightProteins;
    activateFunctions[6] = showProteins;
    activateFunctions[7] = showDietPlanner;
    // activateFunctions[6] = showHistAll;
    // activateFunctions[7] = showCough;
    // activateFunctions[8] = showHistAll;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for (var i = 0; i < 9; i++) {
      updateFunctions[i] = function () {};
    }
    updateFunctions[2] = undisplay;
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showTitle() {
    g.selectAll('.count-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.openvis-title')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);
  }

  /**
   * showFillerTitle - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function showFillerTitle() {
    undisplay

    g.selectAll('.openvis-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.square')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.count-title')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);

    g.selectAll('.bar')
      .transition()
      .duration(0)
      .attr('height', 0)
  }

  /**
   * showGrid - square grid
   *
   * hides: filler count title
   * hides: filler highlight in grid
   * shows: square grid
   *
   */
  function showGrid() {
    dietPlanner = 0;
    g.selectAll('.count-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    // g.selectAll('.bar')
    //   .transition()
    //   .duration(600)
    //   .attr('height', function (d) {return yBarScale(d.ghge_portion);})

      xBarScale.domain(dataSortedByGHGE.map(function(d){ return d.name; }))
      addBars(dataSortedByGHGE)
      // addBars(dataSortedByGHGE)

      g.selectAll('.scatter')
        .attr('opacity', 0)

      g.selectAll('.scatter_pts').remove()
  };

  /**
   * showCalories - calorie scatter
   *
   * hides: nothing
   * (no previous step to hide)
   * shows: calorie scatter plot with all foods
   *
   */
  function showCalories() {
    dietPlanner = 0;
    // xScatterScale.domain(dataSortedByGHGE.map(function(d){ return d.name; }))
    addScatter();
    scatterTransition();
    xBarScale.domain(dataSortedByGHGE.map(function(d){ return d.name; }))
    addBars(dataSortedByGHGE)
  };

  /**
   * highlightMeats
   *
   * hides:
   * (no previous step to hide)
   * shows: meats with full opacity, other foods transparent
   *
   */
  function highlightMeats() {
    dietPlanner = 0;
    xBarScale.domain(dataSortedByGHGE.map(function(d){ return d.name; }))
    addBars(dataSortedByGHGE)

    var meats = filterByGroup(dataSortedByGHGE, "MEAT")

    highlightBar(meats)

    addScatter();
    highlightScatter(meats)

    g.selectAll('.xaxis_bar')
      .attr('opacity', 0)

    g.selectAll('.inactive_scatter')
      .attr('opacity', inactive_opac)

  };

  /**
   * showMeats - meat bar plot
   *
   * hides: bars that aren't meat, scatter plot
   * shows: meat bars only
   *
   */
  function showMeats() {
    dietPlanner = 0;
    var meats = filterByGroup(dataSortedByGHGE, "MEAT")
    xBarScale.domain(meats.map(function(d){ return d.name; }))
    addBars(meats)

    g.selectAll('.inactive_bar')
      .attr('opacity', 0)

    addLabels()

    g.selectAll('.scatter')
      .attr('opacity', 0)

    g.selectAll('.scatter_pts').remove()

  };

  /**
   * highlightProteins
   *
   * hides:
   * (no previous step to hide)
   * shows: scatter and bar, proteins opaque other foods transparent
   *
   */
  function highlightProteins() {
    dietPlanner = 0;
    xBarScale.domain(dataSortedByGHGE.map(function(d){ return d.name; }))
    addBars(dataSortedByGHGE)
    var proteins = filterByGroup(dataSortedByGHGE, "PROTEIN")
    // var bars = g.selectAll('.bar')
    // bars.enter()
    highlightBar(proteins)

    g.selectAll('.xaxis_bar')
      .attr('opacity', 0)

    addScatter();
    highlightScatter(proteins)

    g.selectAll('.xaxis_bar')
      .attr('opacity', 0)

    g.selectAll('.inactive_scatter')
      .attr('opacity', inactive_opac)
  };

  /**
   * showProteins
   *
   * hides: bars that aren't protein and scatter
   * shows: protein bars only
   *
   */
  function showProteins() {
    dietPlanner = 0;
    var proteins = filterByGroup(dataSortedByGHGE, "PROTEIN")
    xBarScale.domain(proteins.map(function(d){ return d.name; }))
    addBars(proteins)

    g.selectAll('.inactive_bar')
      .attr('opacity', 0)

    addLabels()

    g.selectAll('.scatter')
      .attr('opacity', 0)

    g.selectAll('.scatter_pts').remove()

  };

  /**
   * showProteins
   *
   * hides: bars that aren't protein and scatter
   * shows: protein bars only
   *
   */
  function showDietPlanner() {
    dietPlanner = 1;
    xBarScale.domain(dataSortedByGHGE.map(function(d){ return d.name; }))
    addBars(dataSortedByGHGE)

    g.selectAll('.xaxis_scatter')
     .attr('opacity', 1)

     g.selectAll('.yaxis_scatter')
      .attr('opacity', 1)


  };






  /**
  * HELPER FUNCTIONS FOR displays
  * used where repeated functionality needed
  *
  */

  function addToDiet(element) {
    var name = d3.select(element).datum().name;
    addServing(name)
    // dataPoint[0].num_servings += 1

    var dietData = filterByServings(dataSortedByGHGE)



      // .on("click", function(d){removeServing(dietItems, d3.select(this).datum().name)
      //                            filteredData = filterByServings(csvData)
      //                            if (d3.select(this).datum().num_servings == 0){
      //                            d3.select(this).remove();}
      //                            else {plate.selectAll("text")
      //                                             .data(filteredData, function(d){return d.name})
      //                                             .attr("class", "plateText")
      //                                             .text(function(d){return d.num_servings + "X " + d.name + ", " + d.portion_desc})}
      //                            updateBars()})
      updateDietVis(dietData)
      g_dp.selectAll('.dietList')
      .on("click", function(d){removeServing( d3.select(this).datum().name)
                                dietData = filterByServings(dataSortedByGHGE)
                                return updateDietVis(dietData) })


  }

  function updateDietVis(dietData) {
    var dietGHGE = g.selectAll('.dietGHGE')
      .data(dietData, function(d) { return d.name; })

      dietGHGE
      .enter()
      .append('rect')
      .attr('class', 'dietGHGE')

    dietGHGE.exit().remove();

    var dietList = g_dp.selectAll('.dietList')
      .data(dietData, function(d) { return d.name; })

      dietList
      .enter()
      .append('text')
      .attr('class', 'dietList')

    dietList.exit().remove();

    var dietItems = g.selectAll('.dietGHGE').data();

    dietItems = filterByServings(dietItems)

    var meats = filterByGroup(dietItems, "MEAT")
    var proteins = filterByGroup(dietItems, "PROTEIN-NONMEAT")
    var beverages = filterByGroup(dietItems, "BEVERAGE-NONDAIRY")
    var dairy = filterByGroup(dietItems, "DAIRY")
    var fruits = filterByGroup(dietItems, "FRUITS")
    var veg = filterByGroup(dietItems, "VEGETABLES")
    var grains = filterByGroup(dietItems, "GRAINS")

    dietItems = meats.concat(proteins, dairy, fruits, veg, grains, beverages)

    var prev_serv = 0;
    var prev_ghge = 0;
    var order_index = 0;
    dietItems.forEach( function(d) {
      d.num_servings_prev_food = prev_serv;
      d.ghge_portion_prev_food = prev_ghge;
      d.order_index = order_index;
      order_index += 1;
      prev_serv = d.num_servings
      prev_ghge += d.num_servings*d.ghge_portion
    })

    g.selectAll('.dietGHGE')
      .attr('x', function(d) { return 200 })
      .attr("y", function (d) {return height - yDietScale(d.ghge_portion_prev_food + d.num_servings*d.ghge_portion);})
      .attr('height', function(d) { return yDietScale(d.num_servings*d.ghge_portion) + 0.5 })
      .attr('width', 20)
      .attr('fill', function(d) { return d.color })

    g_dp.selectAll('.dietList')
      .attr('fill', function(d) { return d.color })
      .attr('x', function(d) { return 0 })
      .attr("y", function (d) {return d.order_index * 13;}) //height_top + margin_between_plots +
      .text(function(d) { return d.num_servings + 'X ' + d.name + ': ' + d.portion_desc })
  }

  function addServing(name) {
    dataSortedByGHGE.forEach(function(d){
      if (d.name.toUpperCase() == name.toUpperCase()) {
        d.num_servings = d.num_servings + 1;
      }
    })
  }

  function removeServing(name) {
    dataSortedByGHGE.forEach(function(d){
      if (d.name.toUpperCase() == name.toUpperCase()) {
        d.num_servings = d.num_servings - 1;
      }
    })
  }


  function showTooltips(a, dataSortedByGHGE) {
    var name = d3.select(a).datum().name;
    var dataPoint = filterByName(dataSortedByGHGE, name);

    var annotations = g.selectAll(".bar_annotation")
      .data(dataPoint, function(d) { return d.name; })
      .enter()

    annotations.append('text')
      .attr('class', 'bar_annotation mouse_annotation')
      .attr('x', function(d) { return xBarScale(d.name); })
      .attr('y', function(d) { return yBarScale(d.ghge_portion) - 14; })
      .text(function(d) { return d.name })
    annotations.append('text')
      .attr('class', 'bar_annotation mouse_annotation')
      .attr('x', function(d) { return xBarScale(d.name); })
      .attr('y', function(d) { return yBarScale(d.ghge_portion) - 3; })
      .text(function(d) { return d.portion_desc })


    var highlightedBar = g.selectAll(".active_bar")
      .data(dataPoint, function(d) { return d.name; })
      .style("stroke-width", "1");

    var highlightedBarE = highlightedBar.enter()
    .append('text')

    highlightedBar
      .exit()
      .attr('opacity', 0.4)
      .style("stroke-width", "0");

    var highlightedScatter = g.selectAll(".active_scatter")
      .data(dataPoint, function(d) { return d.name; })
      .attr('r', 4)
      .style("stroke", "black")
      .style("stroke-width", "1.5");

    var highlightedScatterE = highlightedScatter.enter();

    highlightedScatter
      .exit()
      .attr('opacity', inactive_opac)
      .style("stroke-width", "0");

    var scatterAnnotations = g.selectAll('.scatter_annotation')
      .data(highlightedScatter.data(), function(d) { return d.name })
      .enter()

    scatterAnnotations.append('text')
      .attr('class', 'scatter_annotation mouse_annotation')
      .attr("x", function (d) {return xScatterScale(d.kcal_portion);})
      .attr("y", function (d) {return height_top + margin_between_plots + yScatterScale(d.ghge_portion);})
      .classed('scatter', true)
      .text(function(d) { return d.name })

  };

  // Undoes the highlighting from displayName (removes stroke and tooltip)
  function undisplay () {
    g.selectAll(".mouse_annotation").remove()
      // .attr('opacity', 0);

    g.selectAll(".active_bar")
        .attr('opacity', 1.0)
        .style("stroke-width", "0");

    g.selectAll(".active_scatter")
        .attr('opacity', 1.0)
        .attr('r', 3)
        .style("stroke-width", "0");
  }

  function addBars(data){
    var bars = g.selectAll('.bar')
      .data(data, function(d) { return d.name })
      .attr('class', 'bar active_bar')
      .attr('x', function(d) { return xBarScale(d.name); })
      .attr('y', function(d) { return yBarScale(d.ghge_portion); })//function (d) {return yBarScale(d.ghge_portion);})
      .attr('fill', function (d) { return d.color; })
      // .attr('width', xBarScale.bandwidth())
      // .attr('height', function (d) {return yBarScale(d.ghge_portion);})
      .style("stroke", "black")
      .style("stroke-width", "0")
      .attr('opacity', 1.0)
      .on("mouseover",	function(){ var element = this;
                                    return showTooltips(element, dataSortedByGHGE); })
      .on("mouseout", undisplay)
      .on("click", function() { if (dietPlanner > 0) { var element = this;
          return addToDiet(element) }
        });

    bars.enter()
      .append('rect')
      .attr('class', 'bar active_bar')
      .attr('x', function(d) { return xBarScale(d.name); })
      .attr('y', function(d) { return yBarScale(d.ghge_portion); })//function (d) {return yBarScale(d.ghge_portion);})
      .attr('fill', function (d) { return d.color; })
      // .attr('width', xBarScale.bandwidth())
      // .attr('height', function (d) {return yBarScale(d.ghge_portion);})
      .style("stroke", "black")
      .style("stroke-width", "0")
      .attr('opacity', 1.0)
      .on("mouseover",	function(){ var element = this;
                                    return showTooltips(element, dataSortedByGHGE); })
      .on("mouseout", undisplay)
      .on("click", function() { if (dietPlanner > 0) { var element = this;
          return addToDiet(element) }
        });

    bars.exit()
      .attr("height", 0) //remove()
      .classed('active_bar', false)
      .classed('inactive_bar', true)

    slowTransition();

  };

  function addLabels() {
    g.selectAll('.xaxis_bar')
      .call(d3.axisBottom(xBarScale))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-0.5em")
        .attr("transform", "rotate(-65)")

    g.selectAll('.yaxis_bar')
      .call(d3.axisLeft(yBarScale))


    g.selectAll('.xaxis_bar').selectAll('path').remove()

    // g.selectAll('.xaxis_bar')
    //   .transition()
    //   .duration(600)
    //   .attr('opacity', 1)
    //
    // g.selectAll('.yaxis_bar')
    //   .transition()
    //   .duration(600)
    //   .attr('opacity', 1)

  };

  function highlightBar(data) {
    var highlightedBar = g.selectAll(".bar")
      .data(data, function(d) { return d.name; })

    var highlightedBarE = highlightedBar.enter();

    highlightedBar
      .exit()
      .attr('opacity', inactive_opac)
      .classed('active_bar', false)
      .classed('inactive_bar', true)
      .on("mouseover",	function(){})

  };

  function addScatter(data){
    var circles = g.selectAll(".scatter")
      .data(dataSortedByGHGE, function(d){return d.name})
      .attr("class", 'scatter scatter_pts active_scatter')
      .attr('r', 3)
      .attr("fill", function(d) {return d.color;})
      .attr("cx", function (d) {return xScatterScale(d.kcal_portion);})
      .attr("cy", function (d) {return height_top + margin_between_plots + yScatterScale(d.ghge_portion);})
      .attr('opacity', 1)
      .on("mouseover",	function(){ var element = this;
                                    return showTooltips(element, dataSortedByGHGE); })
      .on("mouseout", undisplay)

     circles.enter().append("circle")
            .attr('r', 3)
            .attr("class", 'scatter scatter_pts active_scatter')
            .attr("fill", function(d) {return d.color;})
            .attr("cx", function (d) {return xScatterScale(d.kcal_portion);})
            .attr("cy", function (d) {return height_top + margin_between_plots + yScatterScale(d.ghge_portion);})
            .attr('opacity', 0)
            .on("mouseover",	function(){ var element = this;
                                          return showTooltips(element, dataSortedByGHGE); })
            .on("mouseout", undisplay)

     g.selectAll('.xaxis_scatter')
      .classed('scatter', true)
      .call(d3.axisBottom(xScatterScale))

     g.selectAll('.yaxis_scatter')
     .classed('scatter', true)
     .call(d3.axisLeft(yScatterScale))

     g.selectAll('.yaxis_scatter')
      .transition()
      .duration(600)
      .attr('opacity', 1)

      g.selectAll('.xaxis_scatter')
       .transition()
       .duration(600)
       .attr('opacity', 1)

  }

  function highlightScatter(data) {
    var highlightedScatter = g.selectAll(".scatter_pts")
      .data(data, function(d) { return d.name; });

    highlightedScatter
      .exit()
      .classed('active_scatter', false)
      .classed('inactive_scatter', true)
      .attr('opacity', inactive_opac)
      .on("mouseover",	function(){});

    scatterTransition();

  };

  function slowTransition() {
    g.selectAll('.active_bar')
      .transition()
      .duration(600)
      .attr('height', function (d) {return height_top - yBarScale(d.ghge_portion);})
      .attr('width', xBarScale.bandwidth())
  };

  function scatterTransition() {
    g.selectAll('.active_scatter')
      .transition()
      .duration(600)
      .attr('opacity', 1.0)
  };



  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

   function filterByServings(data) {
       var filteredPoints = data.filter(function (d) {
         return d.num_servings > 0
       });
       return filteredPoints;
   };

   function sortDataByGHGE(rawData){
     sortedData = rawData.sort(function(x, y){
        return d3.descending(x.ghge_portion, y.ghge_portion);
     });
     return sortedData;
   }

   // Filter data to only return data with a score above minimumScore
   function filterByName(data, name) {
       var filteredPoints = data.filter(function (d) {
         return d.name.toUpperCase() == name.toUpperCase()
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
         } else if (cat.toUpperCase() == "PROTEIN-NONMEAT") { return (d.protein > 0 && d.meat == 0)
         } else if (cat.toUpperCase() == "BEVERAGE-NONDAIRY") { return (d.beverage > 0 && d.dairy == 0)
         } else {return d}
       });
       return filteredPoints;
   };


  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function (index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select('#vis')
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
}

// // load data and display
// d3.tsv('data/words.tsv', display);

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
       beverage : +d.Beverage,
       color: d.color,
       num_servings: 0,
       num_servings_prev_food: 0,
       ghge_portion_prev_food: 0,
       order_index: 0
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
                   } else if (d.beverage> 0) {d.color = color = "#DAA520" //"#a65628"
                   } else {d.color = "#80b1d3"}
                   })
   display(csvData);
};
