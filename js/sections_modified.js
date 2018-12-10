//BUGS TO WORK OUT:
// scrolling fast leaves certain elements shown
// when mouseover scatter pt, unstable sometimes
// axes visible at wrong times
//clicking myfoods before any food is buggy

//WISHLIST
//would like to have axes scale when go over 150% DV or median in dp
// smooth transitions

//cite:
//https://stackoverflow.com/questions/3664381/force-page-scroll-position-to-top-at-page-refresh-in-html
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
}

/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function () {
  // constants to define the size
  // and margins of the vis area.
  var width = 470;//650;
  var height = window.innerHeight - 100//500;//700;//800;//520;
  var margin = { top: 40, left: 100, bottom: 30, right: 230 }; // Changes margin between vis and other things
  var margin_between_plots = 100;
  var height_top = height/2 - margin_between_plots/2;
  var height_bot = height_top;
  var inactive_opac = 0.2;
  var xNutrients = 300;
  var nutBarWidth = 30;
  var nutBarMarg = 20;
  var xDiet = 0;
  var barWidth = 50
  var refOffset = 3
  var xLeg = width + 50;
  var yLeg = 50;
  var legSize = 12;
  var legMarg = 4;



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

  dietItems = []

  var ghge_label = [{name: 'Total Emissions'}]
  var xDietScale = d3.scaleBand()
    .range([xDiet - barWidth, xDiet + barWidth])
    .domain(ghge_label.map(function(d){ return d.name; }))

  var yDietScale = d3.scaleLinear()
    .range([0, height_top]);

  var nut_label = [{name: 'Calories'},
                    {name: 'Carbs'},
                    {name: 'Protein'},
                    {name: 'Fat'}]
  var xDVScale = d3.scaleBand()
    .range([xNutrients, xNutrients + 4*(nutBarWidth + nutBarMarg)])
    .domain(nut_label.map(function(d){ return d.name; }))

  var yDVScale = d3.scaleLinear()
    .range([0, height_top]);

  var q1 = 1.94;
  var med = 2.8;
  var q5 = 6.91;
  yDietScale.domain([0, med + 0.5*(med)])
  yDVScale.domain([0, 150])

  var yDietScaleAxis = d3.scaleLinear()
    .range([height_top, 0])
    .domain([0, med + 0.5*(med)])

  var yDVScaleAxis = d3.scaleLinear()
    .range([height_top, 0])
    .domain([0, 150])


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

      xBarScale.domain(dataSortedByGHGE.map(function(d){ return d.name; }))

      var maxKcal = d3.max(dataSortedByGHGE, function (d) { return d.kcal_portion; });
      xScatterScale.domain([0, maxKcal + 0.05*maxKcal])


      miles1 = 0.41
      miles5 = 5*miles1;
      med = 2.8;

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

    g_dp.append('text')
      .text('My Diet:')
      .classed('title', true)

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
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .attr("class", "xaxis_scatter")
      .attr('opacity', 0)

      g.append('g')
        .attr('transform', `translate(${barWidth/2}, ${height})`)
        .attr("class", "xaxis_diet")
        .attr('opacity', 0)

    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr("class", "xaxis_nutrients")
      .attr('opacity', 0)

      g.append('g')
        .attr('transform', `translate(${xDiet - barWidth/2}, ${height_top + margin_between_plots})`)
        .attr("class", "yaxis_diet")
        .attr('opacity', 0)

    g.append('g')
      .attr('transform', `translate(${xNutrients}, ${height_top + margin_between_plots})`)
      .attr("class", "yaxis_nutrients")
      .attr('opacity', 0)

    g.append('g')
      .attr('transform', `translate(0, ${height_top + margin_between_plots - margin.bottom})`)
      // .attr('transform', `translate(0, ${height - margin.bottom})`)
      .attr("class", "yaxis_scatter")
      .attr('opacity', 0)

    g.append('line')
      .attr('class', 'refLine mile1')
      .attr('opacity', 0)

      g.append('line')
        .attr('class', 'refLine mile5')
        .attr('opacity', 0)

    g.append('line')
      .attr('class', 'refLine mile1_d')
      .attr('opacity', 0)

      g.append('line')
        .attr('class', 'refLine mile5_d')
        .attr('opacity', 0)

        g.append('line')
          .attr('class', 'refLine mile10_d')
          .attr('opacity', 0)

        g.append('line')
          .attr('class', 'refLine dv100')
          .attr('opacity', 0)

          g.append('line')
            .attr('class', 'refLine med')
            .attr('opacity', 0)

    g_lab = svg.append('g')
    g_lab.append('text').attr('class', 'plotTitle_scatter')


    mile5_refTxt = g.append('text')
    .attr("text-anchor", "end")
    .classed('refTxt', true)
    .classed('mile5', true)
    .attr('opacity', 0)
    .text("5 Road Miles")

    mile1_refTxt = g.append('text')
    .attr("text-anchor", "end")
    .classed('refTxt', true)
    .classed('mile1', true)
    .attr('opacity', 0)
    .text("1 Road Mile")

    mile5d_refTxt = g.append('text')
    .attr("text-anchor", "end")
    .classed('refTxt', true)
    .classed('diet', true)
    .attr('opacity', 0)
    .text("5 Road Miles")

    mile1d_refTxt = g.append('text')
    .attr("text-anchor", "end")
    .classed('refTxt', true)
    .classed('diet', true)
    .attr('opacity', 0)
    .text("1 Road Mile")

    med_refTxt = g.append('text')
    .attr("text-anchor", "end")
    .classed('refTxt', true)
    .classed('diet', true)
    .attr('opacity', 0)
    .text("Median")

    dv_refTxt = g.append('text')
    .attr("text-anchor", "end")
    .classed('refTxt', true)
    .classed('diet', true)
    .attr('opacity', 0)
    .text("100% Daily Value")



  //   // count openvis title
  //   g.append('text')
  //     .attr('class', 'title openvis-title')
  //     .attr('x', width / 2)
  //     .attr('y', height / 3)
  //     .text('2013');
  //
  //   g.append('text')
  //     .attr('class', 'sub-title openvis-title')
  //     .attr('x', width / 2)
  //     .attr('y', (height / 3) + (height / 5))
  //     .text('OpenVis Conf');
  //
  //   g.selectAll('.openvis-title')
  //     .attr('opacity', 0);
  //
  //   // count filler word count title
  //   g.append('text')
  //     .attr('class', 'title count-title highlight')
  //     .attr('x', width / 2)
  //     .attr('y', height / 3)
  //     .text('180');
  //
  //   g.append('text')
  //     .attr('class', 'sub-title count-title')
  //     .attr('x', width / 2)
  //     .attr('y', (height / 3) + (height / 5))
  //     .text('Filler Words');
  //
  //   g.selectAll('.count-title')
  //     .attr('opacity', 0);
  //
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
    activateFunctions[0] = showGrid;
    activateFunctions[1] = show5Miles;
    activateFunctions[2] = show1Mile;
    activateFunctions[3] = showCalories;
    activateFunctions[4] = highlightMeats;//showMeats;
    activateFunctions[5] = showMeats;
    activateFunctions[6] = highlightProteins;
    activateFunctions[7] = showProteins;
    activateFunctions[8] = showDietPlanner;
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
      updateFunctions[i] = undisplay; //function () {};
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

      // svg.append('text')
      //   .attr('class', 'yaxisLabel_bar')
           // .text('')
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
    var entries = [{name: "Meat", color: "#e41a1c", order_index:0, tag: "MEAT"},
                   {name: "Protein (non-meat)", color: "#ff7f00",order_index:1, tag: "PROTEIN-NONMEAT"},
                   {name: "Vegetables", color:"#4daf4a",order_index:2, tag: "VEGETABLES"},
                   {name: "Fruit", color: "#f781bf",order_index:3, tag: "FRUITS"},
                   {name: "Grains", color: "#a65628", order_index: 4, tag: "GRAINS"},
                   {name: "Dairy", color: "#377eb8", order_index: 5, tag: "DAIRY"},
                   {name: "Beverages", color: "#DAA520", order_index: 6, tag: "BEVERAGE"}];
    makeLegend(entries);
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
      var maxY = d3.max(dataSortedByGHGE, function (d) { return d.ghge_portion; });
      yBarScale.domain([0, maxY + 0.05*maxY])
      addBars(dataSortedByGHGE)
      // addBars(dataSortedByGHGE)

      g.selectAll('.scatter')
        .attr('opacity', 0)

      g.selectAll('.scatter_pts').remove()

      g.selectAll('.mile5')
        .attr('opacity', 0)
        .attr('x2', 0)

      svg.selectAll('.yaxisLabel_bar').remove()
      svg.append('text')
         .attr("transform", "rotate(-90)")
         .attr("class", "yaxisLabel_bar")
         .attr("text-anchor", "middle")
         .attr("x", -(height_top + margin.top + margin.bottom)/2)
         .attr("y",margin.left - 40)
         .classed('axisLabel', true)
         .text("kg CO2 eq. per Serving")//" Equivalent per Serving")

     g.selectAll('.plotTitle_bar').remove()
     g.append('text')
        .attr("class", "plotTitle_bar")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y",height - 2*height_top - margin_between_plots - 25)
        .classed('plotTitle', true)
        .text("Greenhouse Gas Emissions from Food Items")

        removeLabels();
        mile5_refTxt.attr('opacity', 0)

  };

  function show5Miles() {

    console.log([dataSortedByGHGE[0], dataSortedByGHGE[1], dataSortedByGHGE[3]])

    var outliers = [dataSortedByGHGE[0], dataSortedByGHGE[1], dataSortedByGHGE[2]]
    highlightBar(outliers)

    mile5_refTxt
    .attr('x', width - 50)
    .attr('y', yBarScale(miles5) - refOffset)
    .attr('opacity', 1)

    var miles5line = g.selectAll('.mile5')//g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', yBarScale(miles5))
      .attr('y2', yBarScale(miles5))
      // .attr('class', 'refLine mile5')
      // .attr('opacity', 0)

    miles5line
      .transition()
      .duration(600)
      .attr('opacity', 1.0)

    g.selectAll('.mile1').attr('x2', 0)

    g.selectAll('.mile1')
      .attr('opacity', 0)
      .attr('x2', 0)

  mile1_refTxt.attr('opacity', 0)

      // .attr('class refLine barPlot')
  }

  function show1Mile() {
    // var miles1 = 0.41;
    addBars(dataSortedByGHGE)

    var mile1line = g.selectAll('.mile1')//g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', yBarScale(miles1))
      .attr('y2', yBarScale(miles1))
      // .attr('class', 'refLine mile1')
      // .attr('opacity', 0)

    mile1line
      .transition()
      .duration(600)
      .attr('opacity', 1.0)

      mile1_refTxt
      .attr('x', width - 50)
      .attr('y', yBarScale(miles1) - refOffset)
      .attr('opacity', 1)

    svg.selectAll('.xaxisLabel_scatter').remove()
    svg.selectAll('.yaxisLabel_scatter').remove()
    svg.selectAll('.plotTitle_scatter').remove()
    removeLabels();
      // .attr('class refLine barPlot')
  }

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
    // var maxY = d3.max(dataSortedByGHGE, function (d) { return d.ghge_portion; });
    // yBarScale.domain([0, maxY + 0.05*maxY])
    addBars(dataSortedByGHGE)
    removeLabels();
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
    var maxY = d3.max(dataSortedByGHGE, function (d) { return d.ghge_portion; });
    yBarScale.domain([0, maxY + 0.05*maxY])
    addBars(dataSortedByGHGE)

    var meats = filterByGroup(dataSortedByGHGE, "MEAT")

    highlightBar(meats)

    addScatter();
    highlightScatter(meats)

    g.selectAll('.xaxis_bar')
      .attr('opacity', 0)

    g.selectAll('.inactive_scatter')
      .attr('opacity', inactive_opac)
    removeLabels();
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
    var maxY = d3.max(meats, function (d) { return d.ghge_portion; });
    yBarScale.domain([0, maxY + 0.05*maxY])
    addBars(meats)

    g.selectAll('.inactive_bar')
      .attr('opacity', 0)

    addLabels()

    g.selectAll('.scatter')
      .attr('opacity', 0)

    g.selectAll('.scatter_pts').remove()
    svg.selectAll('.xaxisLabel_scatter').remove()
    svg.selectAll('.yaxisLabel_scatter').remove()
    svg.selectAll('.plotTitle_scatter').remove()

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
    var maxY = d3.max(dataSortedByGHGE, function (d) { return d.ghge_portion; });
    yBarScale.domain([0, maxY + 0.05*maxY])
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

    removeLabels();
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
    var maxY = d3.max(proteins, function (d) { return d.ghge_portion; });
    yBarScale.domain([0, maxY + 0.05*maxY])
    addBars(proteins)

    g.selectAll('.inactive_bar')
      .attr('opacity', 0)

    addLabels()

    g.selectAll('.scatter')
      .attr('opacity', 0)

    g.selectAll('.scatter_pts').remove()

    g.selectAll('.diet')
        .attr('opacity', 0)

  svg.selectAll('.xaxisLabel_scatter').remove()
  svg.selectAll('.yaxisLabel_scatter').remove()
  svg.selectAll('.plotTitle_scatter').remove()
  svg.selectAll('.yaxisLabel_DV').remove()
  svg.selectAll('.yaxisLabel_diet').remove()
  g.selectAll('.legend').remove()

  var entries = [{name: "Meat", color: "#e41a1c", order_index:0, tag: "MEAT"},
                 {name: "Protein (non-meat)", color: "#ff7f00",order_index:1, tag: "PROTEIN-NONMEAT"},
                 {name: "Vegetables", color:"#4daf4a",order_index:2, tag: "VEGETABLES"},
                 {name: "Fruit", color: "#f781bf",order_index:3, tag: "FRUITS"},
                 {name: "Grains", color: "#a65628", order_index: 4, tag: "GRAINS"},
                 {name: "Dairy", color: "#377eb8", order_index: 5, tag: "DAIRY"},
                 {name: "Beverages", color: "#DAA520", order_index: 6, tag: "BEVERAGE"}];
  makeLegend(entries);

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
    g.append('text')
      .attr('x', xLeg)
      .attr('y', yLeg - (legSize + legMarg))
      .text('Click food group to filter')
      .classed('diet', true)

    svg.selectAll('.yaxisLabel_diet').remove()
    svg.append('text')
       .attr("transform", "rotate(-90)")
       .attr("class", "yaxisLabel_diet")
       .attr("text-anchor", "middle")
       .attr("x", -((height_top + margin.top + margin.bottom)/2 +height_top + margin_between_plots - margin.bottom))
       .attr("y", xDiet + 30)
       .classed('axisLabel', true)
       .classed('diet', true)
       // .attr('opacity', 0)
       .text("Total kg CO2 eq.")

       svg.selectAll('.yaxisLabel_DV').remove()
       svg.append('text')
          .attr("transform", "rotate(-90)")
          .attr("class", "yaxisLabel_DV")
          .attr("text-anchor", "middle")
          .attr("x", -((height_top + margin.top + margin.bottom)/2 +height_top + margin_between_plots - margin.bottom))
          .attr("y",xNutrients + 60)
          .classed('axisLabel', true)
          .classed('diet', true)
          // .attr('opacity', 0)
          .text("% Daily Value")

    // g.selectAll('.xaxis_diet')
    //  // .classed('scatter', true)
    //  .call(d3.axisBottom(xScatterScale))
    //  .attr('opacity')

     g.selectAll('.yaxis_diet')
      // .classed('scatter', true)
      .classed('diet', true)
      .call(d3.axisLeft(yDietScaleAxis))
      .attr('opacity', 1)

      g.selectAll('.yaxis_nutrients')
       // .classed('scatter', true)
       .classed('diet', true)
       .call(d3.axisLeft(yDVScaleAxis))
       .attr('opacity', 1)

    xBarScale.domain(dataSortedByGHGE.map(function(d){ return d.name; }))
    var maxY = d3.max(dataSortedByGHGE, function (d) { return d.ghge_portion; });
    yBarScale.domain([0, maxY + 0.05*maxY])
    addBars(dataSortedByGHGE)

    g.selectAll('.xaxis_bar')
      .attr('opacity', 0)

    g.selectAll('.scatter')
      .attr('opacity', 0)

      g.selectAll('.xaxis_diet')
       .classed('diet', true)
       .call(d3.axisBottom(xDietScale))

       g.selectAll('.xaxis_nutrients')
        .classed('diet', true)
        .call(d3.axisBottom(xDVScale))

      g.selectAll('.xaxis_diet')
        .selectAll("text")
        .classed('dpText', true)


    g.selectAll('.xaxis_nutrients')
      .selectAll("text")
      .classed('dpText', true)

      var extension = 100

      g.selectAll('.mile5_d')//g.append('line')
        .attr('x2', xDiet - barWidth/2)
        .attr('x1', xDiet + barWidth + 20 + extension)
        .attr('y1', height - yDietScale(miles5))
        .attr('y2', height - yDietScale(miles5))
        .classed('diet', true)
        .classed('dp_ref', true)
        .attr('opacity', 1)

        g.selectAll('.mile1_d')//g.append('line')
          .attr('x2', xDiet - barWidth/2)
          .attr('x1', xDiet + barWidth + 20 + extension)
          .attr('y1', height - yDietScale(miles1))
          .attr('y2', height - yDietScale(miles1))
          .classed('diet', true)
          .classed('dp_ref', true)
          .attr('opacity', 1)

          g.selectAll('.med')//g.append('line')
            .attr('x2', xDiet - barWidth/2)
            .attr('x1', xDiet + barWidth + 20 + extension)
            .attr('y1', height - yDietScale(med))
            .attr('y2', height - yDietScale(med))
            .classed('diet', true)
            .classed('dp_ref', true)
            .attr('opacity', 1)

      g.selectAll('.dv100')//g.append('line')
        .attr('x2', xNutrients)
        .attr('x1', xNutrients + 4*(nutBarWidth + nutBarMarg) + extension)
        .attr('y1', height - yDVScale(100))
        .attr('y2', height - yDVScale(100))
        .classed('diet', true)
        .classed('dp_ref', true)
        .attr('opacity', 1)


        dv_refTxt
          .attr('opacity', 1)
          .attr('x', xNutrients + 4*(nutBarWidth + nutBarMarg)+  extension)
          .attr('y', height - yDVScale(100) - refOffset)


      mile5d_refTxt
        .attr('opacity', 1)
        .attr('x', xDiet + barWidth + 20 + extension)
        .attr('y', height - yDietScale(miles5) - refOffset)

        mile1d_refTxt
          .attr('opacity', 1)
          .attr('x', xDiet + barWidth + 20 + extension)
          .attr('y', height - yDietScale(miles1) - refOffset)

          med_refTxt
            .attr('opacity', 1)
            .attr('x', xDiet + barWidth + 20 + extension)
            .attr('y', height - yDietScale(med) - refOffset)




      g.selectAll('.diet')
          .attr('opacity', 1)

console.log('...')

var entries = [{name: "Meat", color: "#e41a1c", order_index:0, tag: "MEAT"},
               {name: "Protein (non-meat)", color: "#ff7f00",order_index:1, tag: "PROTEIN-NONMEAT"},
               {name: "Vegetables", color:"#4daf4a",order_index:2, tag: "VEGETABLES"},
               {name: "Fruit", color: "#f781bf",order_index:3, tag: "FRUITS"},
               {name: "Grains", color: "#a65628", order_index: 4, tag: "GRAINS"},
               {name: "Dairy", color: "#377eb8", order_index: 5, tag: "DAIRY"},
               {name: "Beverages", color: "#DAA520", order_index: 6, tag: "BEVERAGE"},
               {name: "All Foods", color: 'white', order_index: 7, tag: "ALLFOODS"},
               {name: "My Foods", color: 'white', order_index: 8, tag: "DIET"}];
      makeLegend(entries);

      svg.selectAll('.xaxisLabel_scatter').remove()
      svg.selectAll('.yaxisLabel_scatter').remove()
      svg.selectAll('.plotTitle_scatter').remove()
      removeLabels();


  };






  /**
  * HELPER FUNCTIONS FOR displays
  * used where repeated functionality needed
  *
  */

  function makeLegend(entries) {
    // var categories = ["Meat", "Protein (non-meat)", "Beverage" ,"Dairy","Fruits", "Vegetables", "Grains"];

    // var entries = [{name: "Meat", color: "#e41a1c", order_index:0, tag: "MEAT"},
    //                {name: "Protein (non-meat)", color: "#ff7f00",order_index:1, tag: "PROTEIN-NONMEAT"},
    //                {name: "Vegetables", color:"#4daf4a",order_index:2, tag: "VEGETABLES"},
    //                {name: "Fruit", color: "#f781bf",order_index:3, tag: "FRUITS"},
    //                {name: "Grains", color: "#a65628", order_index: 4, tag: "GRAINS"},
    //                {name: "Dairy", color: "#377eb8", order_index: 5, tag: "DAIRY"},
    //                {name: "Beverages", color: "#DAA520", order_index: 6, tag: "BEVERAGE"},
    //                {name: "All Foods", color: 'black', order_index: 7, tag: "ALLFOODS"},
    //                {name: "My Foods", color: 'black', order_index: 8, tag: "DIET"}];

    var legend = g.selectAll('.legend')
      .data(entries, function(d) { return d.name })
      .enter()

    console.log('leg')

    // g.append('rect')
    // .attr('x', xLeg)
    // .attr('y', yLeg)
    // .attr('height', 100)
    // .attr('width', 100)

    legend.append('rect')
      .attr('class', 'legend')
      .attr('x', xLeg)
      .attr('y', function (d) { return yLeg + d.order_index*(legSize+legMarg) })
      .attr('height', legSize)
      .attr('width', legSize)
      .attr('fill', function (d) { return d.color })
      .on("click", function(d){var element = this
                               return legendClick(element)})

    legend.append('text')
      .attr('class', 'legend')
      .attr('alignment-baseline', 'hanging')
      .attr('x', xLeg + legSize + legMarg)
      .attr('y', function (d) { return yLeg + d.order_index*(legSize+legMarg) })
      .text(function (d) { return d.name })
      .on("click", function(d){var element = this
                               return legendClick(element)})

   legend.exit().remove()
      // .on("click", function(d){group = filterByGroup(dataSortedByGHGE, d3.select(this).datum().tag)
      //                                   xBarScale.domain(group.map(function(d){ return d.name; }))
      //                                   return addBars(group)})

  }

  /**
  /
  **/
  function legendClick(element){
    if (dietPlanner > 0) {
    if (d3.select(element).datum().tag.toUpperCase() == "DIET") {
      console.log("HI")
      var group = sortDataByGHGE(dietItems)
      var maxY = d3.max(group, function (d) { return d.ghge_portion; });
      yBarScale.domain([0, maxY + 0.05*maxY])
      xBarScale.domain(group.map(function(d){ return d.name; }))
      addBars(group)
    } else{
    var group = filterByGroup(dataSortedByGHGE, d3.select(element).datum().tag)
                                      var maxY = d3.max(group, function (d) { return d.ghge_portion; });
                                      yBarScale.domain([0, maxY + 0.05*maxY])
                                      xBarScale.domain(group.map(function(d){ return d.name; }))
                                      addBars(group)
                                    }
                                    if(d3.select(element).datum().tag.toUpperCase() != "ALLFOODS") {addLabels()
                                    } else {
                                      removeLabels()
                                    }
                                  }

  };

/**
/
**/
  function addToDiet(element) {
    var name = d3.select(element).datum().name;
    addServing(name)
    var dietData = filterByServings(dataSortedByGHGE)

      updateDietVis(dietData)
      g_dp.selectAll('.dietList')
      .on("mouseover",	function(){ var element = this;
                                    return showTooltips(element, dataSortedByGHGE); })
      .on("mouseout", function(){return undisplay()})
      .on("click", function(d){removeServing( d3.select(this).datum().name)
                                dietData = filterByServings(dataSortedByGHGE)
                                return updateDietVis(dietData) })

  }

  function updateDietVis(dietData) {
    undisplay()
    var dietGHGE = g.selectAll('.dietGHGE')
      .data(dietData, function(d) { return d.name; })
    dietGHGE.enter()
      .append('rect')
      .attr('class', 'dietGHGE')
      .classed('diet', true)
    dietGHGE.exit().remove();

    var dietKcal = g.selectAll('.dietKcal')
      .data(dietData, function(d) { return d.name; })
    dietKcal.enter()
      .append('rect')
      .attr('class', 'dietKcal')
      .classed('diet', true)
    dietKcal.exit().remove();

    var dietCarb = g.selectAll('.dietCarb')
      .data(dietData, function(d) { return d.name; })
    dietCarb.enter()
      .append('rect')
      .attr('class', 'dietCarb')
      .classed('diet', true)
    dietCarb.exit().remove();

    var dietProtein = g.selectAll('.dietProtein')
      .data(dietData, function(d) { return d.name; })
    dietProtein.enter()
      .append('rect')
      .attr('class', 'dietProtein')
      .classed('diet', true)
    dietProtein.exit().remove();

    var dietFat = g.selectAll('.dietFat')
      .data(dietData, function(d) { return d.name; })
    dietFat.enter()
      .append('rect')
      .attr('class', 'dietFat')
      .classed('diet', true)
    dietFat.exit().remove();


    var dietList = g_dp.selectAll('.dietList')
      .data(dietData, function(d) { return d.name; })
      .classed('diet', true)
    dietList.enter()
      .append('text')
      .attr('class', 'dietList')
      .classed('diet', true)
    dietList.exit().remove();

    dietItems = g.selectAll('.dietGHGE').data();

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
    var prev_kcal = 0;
    var prev_carb = 0;
    var prev_protein = 0;
    var prev_fat = 0;
    var order_index = 0;
    dietItems.forEach( function(d) {
      // d.num_servings_prev_food = prev_serv;
      d.ghge_portion_prev_food = prev_ghge;
      d.kcal_prev = prev_kcal;
      d.carb_prev = prev_carb;
      d.protein_prev = prev_protein;
      d.fat_prev = prev_fat;
      d.order_index = order_index;
      order_index += 1;
      // prev_serv = d.num_servings
      prev_ghge += d.num_servings*d.ghge_portion
      prev_kcal += d.num_servings*d.kcal_portion
      prev_carb += d.num_servings*d.carb_portion
      prev_protein += d.num_servings*d.protein_portion
      prev_fat += d.num_servings*d.fat_portion
    })

    g.selectAll('.dietGHGE')
      .attr('x', function(d) { return xDietScale('Total Emissions') + barWidth})// - barWidth/2})
      .attr("y", function (d) {return height - yDietScale(d.ghge_portion_prev_food + d.num_servings*d.ghge_portion);})
      .attr('height', function(d) { return yDietScale(d.num_servings*d.ghge_portion) + 0.5 })
      .attr('width', barWidth)
      .attr('fill', function(d) { return d.color })

    g.selectAll('.dietKcal')
      .attr('x', xDVScale('Calories')+ 10)//function(d) { return 250 })
      .attr("y", function (d) {return height - yDVScale( 100*(d.kcal_prev + d.num_servings*d.kcal_portion)/2000 );})
      .attr('height', function(d) { return yDVScale( 100*(d.num_servings*d.kcal_portion)/2000 ) + 0.5 })
      .attr('width', nutBarWidth)//20)
      .attr('fill', function(d) { return d.color })

    g.selectAll('.dietCarb')
      .attr('x', xDVScale('Carbs')+ 10)//function(d) { return 300 })
      .attr("y", function (d) {return height - yDVScale( 100*(d.carb_prev + d.num_servings*d.carb_portion)/320 );})
      .attr('height', function(d) { return yDVScale( 100*d.num_servings*d.carb_portion/320 ) + 0.5 })
      .attr('width', nutBarWidth)//20)
      .attr('fill', function(d) { return d.color })

    g.selectAll('.dietProtein')
      .attr('x', xDVScale('Protein')+ 10)//function(d) { return 350 })
      .attr("y", function (d) {return height - yDVScale( 100*(d.protein_prev + d.num_servings*d.protein_portion)/50 );})
      .attr('height', function(d) { return yDVScale(100*d.num_servings*d.protein_portion/50) + 0.5 })
      .attr('width', nutBarWidth)//20)
      .attr('fill', function(d) { return d.color })

    g.selectAll('.dietFat')
      .attr('x', xDVScale('Fat') + 10)//function(d) { return 400 })
      .attr("y", function (d) {return height - yDVScale( 100*(d.fat_prev + d.num_servings*d.fat_portion)/70 );})
      .attr('height', function(d) { return yDVScale( 100*(d.num_servings*d.fat_portion)/70 ) + 0.5 })
      .attr('width', nutBarWidth)//20)
      .attr('fill', function(d) { return d.color })

    g_dp.selectAll('.dietList')
      .attr('fill', function(d) { return d.color })
      .attr('x', function(d) { return 0 })
      .attr("y", function (d) {return 15 + d.order_index * 13;}) //height_top + margin_between_plots +
      .text(function(d) { return d.num_servings + 'X ' + d.name})// + ': ' + d.portion_desc })

      g.selectAll('.dp_ref').moveToFront()
      g.selectAll('.refTxt').moveToFront()
      g.selectAll('.xaxis_bar').moveToFront()
  };






  function showTooltips(a, dataSortedByGHGE) {
    var name = d3.select(a).datum().name;
    var dataPoint = filterByName(dataSortedByGHGE, name);

    var annotations = g.selectAll(".bar_annotation")
      .data(dataPoint, function(d) { return d.name; })
      .enter()

    annotations.append('text')
      .attr('class', 'bar_annotation mouse_annotation')
      .attr('x', function(d) { return xBarScale(d.name); })
      .attr('y', function(d) { return yBarScale(d.ghge_portion) - 14-14; })
      .text(function(d) { return d.name })
    annotations.append('text')
      .attr('class', 'bar_annotation mouse_annotation')
      .attr('x', function(d) { return xBarScale(d.name); })
      .attr('y', function(d) { return yBarScale(d.ghge_portion) - 3-14; })
      .text(function(d) { return d.portion_desc })
      annotations.append('text')
        .attr('class', 'bar_annotation mouse_annotation')
        .attr('x', function(d) { return xBarScale(d.name); })
        .attr('y', function(d) { return yBarScale(d.ghge_portion) - 3; })
        .text(function(d) { return d.ghge_portion.toFixed(2) + ' kg CO2 eq.' })


    var highlightedBar = g.selectAll(".active_bar")
      .data(dataPoint, function(d) { return d.name; })
      .style("stroke-width", "1");

    var highlightedBarE = highlightedBar.enter()
    .append('text')

    highlightedBar
      .exit()
      .attr('opacity', 0.4)
      .style("stroke-width", "0");

      var highlightedText = g_dp.selectAll(".dietList")
        .data(dataPoint, function(d) { return d.name; })

      var highlightedTextE = highlightedBar.enter()
      .append('text')

      highlightedText
        .exit()
        .attr('opacity', inactive_opac)
        // .style("stroke-width", "0");

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
      .attr("y", function (d) {return -14 + height_top + margin_between_plots + yScatterScale(d.ghge_portion);})
      .classed('scatter', true)
      .text(function(d) { return d.name })

      scatterAnnotations.append('text')
        .attr('class', 'scatter_annotation mouse_annotation')
        .attr("x", function (d) {return xScatterScale(d.kcal_portion);})
        .attr("y", function (d) {return  + height_top + margin_between_plots + yScatterScale(d.ghge_portion);})
        .classed('scatter', true)
        .text(function(d) { return d.portion_desc })

        scatterAnnotations.append('text')
          .attr('class', 'scatter_annotation mouse_annotation')
          .attr("x", function (d) {return xScatterScale(d.kcal_portion);})
          .attr("y", function (d) {return 14 + height_top + margin_between_plots + yScatterScale(d.ghge_portion);})
          .classed('scatter', true)
          .text(function(d) { return d.ghge_portion.toFixed(2) + ' kg CO2 eq.' })


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

  g_dp.selectAll(".dietList")
    .attr('opacity', 1.0)
  }

  function addBars(data){

    mile1_refTxt.attr('y', yBarScale(miles1) - refOffset)
    .transition()
    .duration(600)


    mile5_refTxt.attr('y', yBarScale(miles5) - refOffset)
    .transition()
    .duration(600)

    g.selectAll('.yaxis_bar')
    .transition()
    .duration(600)
    // .classed('scatter', true)
    .call(d3.axisLeft(yBarScale).ticks(5))
    // .ticks(5)

    g.selectAll('.yaxis_bar')
     .transition()
     .duration(600)
     .attr('opacity', 1)



     g.selectAll('.yaxis_bar').selectAll('path').remove()

    var bars = g.selectAll('.bar')
      .data(data, function(d) { return d.name })
      .attr('class', 'bar active_bar')
      // .attr('x', function(d) { return xBarScale(d.name); })
      // .attr('y', function(d) { return yBarScale(d.ghge_portion); })//function (d) {return yBarScale(d.ghge_portion);})
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
      // .attr('x', function(d) { return xBarScale(d.name); })
      // .attr('y', function(d) { return yBarScale(d.ghge_portion); })//function (d) {return yBarScale(d.ghge_portion);})
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

      g.selectAll('active_bar')
      .transition()
      .duration(600)
      .attr('width', xBarScale.bandwidth())

      g.selectAll('.mile5')
      .moveToFront()
      g.selectAll('.mile5')
        .transition()
        .duration(600)
        .attr('y1', yBarScale(miles5))
        .attr('y2', yBarScale(miles5))

        g.selectAll('.mile1')
.moveToFront()
      g.selectAll('.mile1')
        .transition()
        .duration(600)
        .attr('y1', yBarScale(miles1))
        .attr('y2', yBarScale(miles1))



    slowTransition();

  };

  function removeLabels() {
    g.selectAll('.foodLabels')
      .attr('opacity', 0)
  }

  function addLabels() {
    g.selectAll('.xaxis_bar')
      .classed('foodLabels', true)
      .call(d3.axisBottom(xBarScale))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-0.5em")
        .attr("transform", "rotate(-60)")

    // g.selectAll('.yaxis_bar')
    //   .call(d3.axisLeft(yBarScale))


    g.selectAll('.xaxis_bar').selectAll('path').remove()

    g.selectAll('.xaxis_bar')
      .transition()
      .duration(600)
      .attr('opacity', 1)
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
    g.selectAll('.plotTitle_scatter').remove()
    g.append('text')
       .attr("class", "plotTitle_scatter")
       .attr("text-anchor", "middle")
       .attr("x", width/2)
       .attr("y", height - height_top - margin.bottom - 20)// + margin_between_plots - 5)
       .classed('plotTitle', true)
       // .attr('opacity', 0)
       .text("Greenhouse Gas Emissions vs. Calories")

       svg.selectAll('.xaxisLabel_scatter').remove()
       svg.append('text')
          .attr("class", "xaxisLabel_scatter")
          .attr("text-anchor", "middle")
          .attr("x", margin.left + width/2)
          .attr("y",height + 40)
          .classed('axisLabel', true)
          // .attr('opacity', 0)
          .text("Calories per Serving")

       svg.selectAll('.yaxisLabel_scatter').remove()
       svg.append('text')
          .attr("transform", "rotate(-90)")
          .attr("class", "yaxisLabel_scatter")
          .attr("text-anchor", "middle")
          .attr("x", -((height_top + margin.top + margin.bottom)/2 +height_top + margin_between_plots - margin.bottom))
          .attr("y",margin.left - 40)
          .classed('axisLabel', true)
          // .attr('opacity', 0)
          .text("kg CO2 eq. per Serving")

      // svg.selectAll('.yaxisLabel_scatter')
      //   .transition()
      //   .duration(600)
      //   .attr('opacity', 1.0)
      //   svg.selectAll('.xaxisLabel_scatter')
      //     .transition()
      //     .duration(600)
      //     .attr('opacity', 1.0)
      //     svg.selectAll('.plotTitle_scatter')
      //       .transition()
      //       .duration(600)
      //       .attr('opacity', 1.0)


    var circles = g.selectAll(".scatter")
      .data(dataSortedByGHGE, function(d){return d.name})
      .attr("class", 'scatter scatter_pts active_scatter')
      .attr('r', 3)
      .attr("fill", function(d) {return d.color;})
      .attr("cx", function (d) {return xScatterScale(d.kcal_portion);})
      .attr("cy", function (d) {return height_top + margin_between_plots - margin.bottom + yScatterScale(d.ghge_portion);})
      .attr('opacity', 1)
      .on("mouseover",	function(){ var element = this;
                                    return showTooltips(element, dataSortedByGHGE); })
      .on("mouseout", undisplay)

     circles.enter().append("circle")
            .attr('r', 3)
            .attr("class", 'scatter scatter_pts active_scatter')
            .attr("fill", function(d) {return d.color;})
            .attr("cx", function (d) {return xScatterScale(d.kcal_portion);})
            .attr("cy", function (d) {return height_top + margin_between_plots - margin.bottom + yScatterScale(d.ghge_portion);})
            .attr('opacity', 0)
            .on("mouseover",	function(){ var element = this;
                                          return showTooltips(element, dataSortedByGHGE); })
            .on("mouseout", undisplay)

     g.selectAll('.xaxis_scatter')
      .classed('scatter', true)
      .call(d3.axisBottom(xScatterScale))

     g.selectAll('.yaxis_scatter')
     .classed('scatter', true)
     .call(d3.axisLeft(yScatterScale).ticks(5))

     g.selectAll('.yaxis_scatter')
      .transition()
      .duration(0)
      .attr('opacity', 1)

      // g.selectAll('.yaxis_scatter').selectAll('path').remove()

      g.selectAll('.xaxis_scatter')
       .transition()
       .duration(0)
       .attr('opacity', 1)

    // g.selectAll('.xaxis_scatter').selectAll('path').remove()

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
      .attr('x', function(d) { return xBarScale(d.name); })
      .attr('y', function(d) { return yBarScale(d.ghge_portion); })
      .attr('height', function (d) {return height_top - yBarScale(d.ghge_portion);})
      .attr('width', xBarScale.bandwidth())
  };

  function scatterTransition() {
    g.selectAll('.active_scatter')
      .transition()
      .duration(600)
      .attr('opacity', 1.0)
  };

  //Move element to front
  //https://gist.github.com/trtg/3922684
    d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };



  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

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
      if (cat.toUpperCase() == "DIET"){
        return dietItems;
      }
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

d3.csv("filtered_finalProjectDataset.csv", parseInputRow).then(loadData);

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
       order_index: 0,
       kcal_prev: 0,
       carb_prev: 0,
       protein_prev: 0,
       fat_prev: 0
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
