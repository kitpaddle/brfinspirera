// TREEMAP RELATED JS CODE BELOW
// JSON data here: https://www.npoint.io/docs/8aff3d53ede4dc7383ab

const testData = 'https://api.npoint.io/8aff3d53ede4dc7383ab';
const MOVIE_SALES = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

// Window size
const padding = 100;
const width = 1400;
const height = 800;

// create tooltip and svg

const tooltip = d3.select("#wrapper")
                  .append('div')
                  .attr('class', 'tooltip')
                  .attr('id', 'tooltip')
                  .style('opacity', 0);

const svg = d3.select("#wrapper")
                .append('svg')
                .attr("class", "treemap")
                .attr("width", width)
                .attr("height", height);
                

const colorScale = d3.scaleOrdinal()
                     .domain(["SESAR 2022 Digiteal European Sky - Exploratory Research1","SESAR 2022 Digiteal European Sky - Industrial Research","SESAR 3 Digital Sky Demonstrators"])
                     .range(['#ffe8a8','#bcffa8','#a8d3ff']);
const colorScale1 = d3.scaleOrdinal()
                     .domain(["SESAR 2022 Digiteal European Sky - Exploratory Research1","SESAR 2022 Digiteal European Sky - Industrial Research","SESAR 3 Digital Sky Demonstrators"])
                     .range(['#d4c18c','#8fc480','#90b3d6']);

var handleEvents = function( selection ) {
  selection.on('mouseover', function() {
    
    let mouse = d3.pointer(event, svg.node());
    let n = d3.select(this).select('.tile');
    
    n.transition().duration(100).style('fill', "rgb(90,50,50)" );
    tooltip.style('opacity', 1)
            .html( n.attr('data-name')+"<br>"+"Budget: €"+(Math.abs(n.attr('data-value'))/1000000).toFixed(1)+" Millions" )
            .style('top', (mouse[1]-20) + 'px')
            .style('left', (mouse[0]+20) +'px')
     
    
  })
  .on('mouseout', function() {
    let g = d3.select(this);
    let n = g.select('.tile');
    let m = g.select('.waBox');
 
     if(n.classed('legend-item')) {
       n.transition().duration(200)
        .style("fill", d => colorScale(d.data.name));
     } else {
       n.transition().duration(200)
        .style("fill", d => colorScale(d.parent.parent.data.name));
     }
    
    tooltip.style('opacity', 0);
  });
}   

// Get the data and draw it up
d3.json(testData).then(function(data){
  
  //data is already in good json format
  let root = d3.hierarchy(data);    // Make a d3.hierarchy
  root.sum(d => d.value);           // Sum value to display value relative to total value
  root.sort(function (a, b) {       // sort by "height", and if the same, by value
      return b.height - a.height || b.value - a.value
    });
  
  let treemapLayout = d3.treemap()
                        .tile(d3.treemapResquarify)
                        .size([width, height])
                        .paddingTop(12)
                        .paddingBottom(5)
                        .paddingInner(2)
                        //.paddingOuter(5);
  treemapLayout(root);
 
  
  svg
    .selectAll("titles")
    .data(root.descendants().filter(function(d){return d.depth==1}))
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+2})
      .attr("y", function(d){ return d.y0+3})
      .text(function(d){ return d.data.name+" - €"+Math.abs((d.data.budget)/1000000).toFixed(0)+"M" })
      .attr("font-size", "15px")
      .attr("fill",  "white" );
  
  let cell = d3.select("svg")
                .selectAll("g")
                .data(root.leaves())
                .enter()
                .append('g').attr('class', 'node')
                .attr('transform', d => 'translate('+[d.x0, d.y0]+')')
                // Call mouse events to this function
                //.call(handleEvents);
                
  
  cell.append('rect')
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr('class', 'tile')
      .attr('data-name', d => d.data.name)
      .attr('data-id', d => d.data.id)
      .attr('data-value', d => d.data.value)
      .attr('xpos', d => d.x0)
      .attr('ypos', d => d.y0)
      .style("fill", d => colorScale(d.parent.parent.data.name))
      .style("opacity", "0.6")
      .style('stroke', "#fff");
  
  // Adding text and wrapping it so it stays in cells
  cell.append("text")
      .selectAll("tspan") // Using svg tspan element for multiline text
      // Splits between every capital letter
      .data(function(d) { return d.data.name.split(/(?=[A-Z][a-z])/g); })  
      .enter().append("tspan")
      .attr("x", 4)
      .attr("y", function(d, i) { return 13 + i * 10; })
      .text(function(d) { return d; });
  
  cell.on('mouseover', function() {
                    d3.select(this).select('.tile')
                      //.style('fill', 'rgb(90,50,50)')
                      .style('opacity', '0.3')
                  })
                  .on('mouseout', function() {
                    d3.select(this).select('.tile')
                      //.style("fill", d => colorScale(d.parent.parent.data.name))
                      .style('opacity', '0.6')
                  })
                  .on('click', function(){
                    openClick(d3.select(this).select('.tile').attr('data-id'))
                  })

  
  let watitles = svg.selectAll("workAreas")
                  .data(root.descendants().filter(function(d){return d.depth==2}))
                  .enter().append("g")
                  .attr('class', 'node')
                  .attr('transform', d => 'translate('+[d.x0, d.y0-5]+')');

      watitles.append('rect')
          .attr('class', 'waRect')
          .attr('data-id', d => d.data.id)
          .style('stroke', 'white')
          .attr("width", d => d.x1 - d.x0)
          .attr('height', 16)
          .style('fill', d => colorScale1(d.parent.data.name));

      watitles.append("text")
          .attr('x', 4)
            .attr('y', 12)
            .style('fill', 'black')
            .style('font-size', '0.75rem')
            .text(d => d.data.name);
  
  //watitles.lower();
  watitles.on('mouseover', function() {
                    d3.select(this).select('.waRect')
                      .style('fill', 'rgb(90,50,50)')
                      .style('opacity', '0.4')
                      .attr('height', d => d.y1 - d.y0)
                      .style('stroke-width', '8')
                  })
                  .on('mouseout', function() {
                    d3.select(this).select('.waRect')
                      .style("fill", d => colorScale1(d.parent.data.name))
                      .style('opacity', '1')
                      .attr('height', 16)
                      .style('stroke-width', '1')
                  })
                  .on('click', function(){
                    openClick(d3.select(this).select('.waRect').attr('data-id'))
                  })
  
  /* How to make simple built-in tooltip instead of complicated tooltip
 cell.append("title")
      .attr('id','tooltip')
      .text(function(d) { return d.data.name }); */
});

// CONTENT RELATED JS CODE BELOW

var acc = document.getElementsByClassName("accordion");

for (let i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}

let openClick = function(ident){
  for(let i=0; i<ident.length; i++){
    let n;
    if(i==0) n = document.getElementById(ident);
    else n = document.getElementById(ident.slice(0,-i));
    if(!n.classList.contains('active')) n.classList.toggle("active");
    n.nextElementSibling.style.display = "block";
  }
  document.getElementById(ident).scrollIntoView();
}