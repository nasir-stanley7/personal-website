// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;

    let margin = {
      top:30,
      bottom:50,
      right:30,
      left:50
    }
    // Create the SVG container
    let svg = d3.select('#boxplot')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'cornsilk');

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all four platforms or use
    // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform
    

    // Add scales
    let yScale = d3.scaleLinear()
                    .domain(
                      [d3.min(data, d=>d.Likes),
                      d3.max(data, d=>d.Likes)]
                    )
                    .range([height - margin.bottom, margin.top]);
    let xScale = d3.scaleBand()
                    .domain(data.map(d => d.Platform))
                    .range([margin.left, width - margin.right])
                    .padding(0.5);
                  
    // Add x-axis label
    let xAxis = svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom().scale(xScale));

    svg.append('text')
        .attr('x', width/2)
        .attr('y',height - 10)
        .text('Platform')
        .attr('text-anchor', 'middle');
        

    // Add y-axis label
    let yAxis =svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft().scale(yScale));

    svg.append('text')
        .attr('x', 0-height/2)
        .attr('y', 15)
        .text('Likes')
        .attr('transform', 'rotate(-90)');

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const q2 = d3.quantile(values, 0.50);
        const q3 = d3.quantile(values, 0.75);
        const median = d3.median(values);
        const max = d3.max(values);
        return {min, q1, q2, q3, median, max};
    };

    // Rollup the data to get the quantiles for each group
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    // Draw the boxplot using the quantiles for each group
    quantilesByGroups.forEach((quantiles, Platform) => {
        const x = xScale(Platform);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines 
        svg.append('line')
            .attr('x1', x + boxWidth / 2)
            .attr('x2', x + boxWidth / 2)
            .attr('y1', yScale(quantiles.min))
            .attr('y2', yScale(quantiles.max))
            .attr('stroke', 'black')
            .attr('stroke-width', 1);

        // Draw box 
        svg.append('rect')
            .attr('x', x)
            .attr('y', yScale(quantiles.q3))
            .attr('width', boxWidth)
            .attr('height', yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr('fill', 'cadetblue')
            .attr('stroke', 'black')
            .attr('stroke-width', 1);

        // Draw median line
        svg.append('line')
            .attr('x1', x)
            .attr('x2', x + boxWidth)
            .attr('y1', yScale(quantiles.median))
            .attr('y2', yScale(quantiles.median))
            .attr('stroke', 'red')
            .attr('stroke-width', 2);
        
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.LikeAvg = +d.LikeAvg;
    });

    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;

    let margin = {
      top:30,
      bottom:50,
      right:30,
      left:50
    }


    // Create the SVG container
    let svg = d3.select('#barplot')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'cornsilk');

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const x0 = d3.scaleBand()
                  .domain(data.map(d => d.Platform))
                  .range([margin.left, width - margin.right])
                  .padding(0.3); 


    const x1 = d3.scaleBand()
                .domain(data.map(d => d.PostType))
                .range([0, x0.bandwidth()])
                ;
                          

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.LikeAvg)]).nice()
                .range([height - margin.bottom, margin.top])
                

    const color = d3.scaleOrdinal()
                    .domain([...new Set(data.map(d => d.PostType))])
                    .range(["#003366", "#ff7f0e", "#dc143c"]);    
                      
    // Add scales x0 and y  
    let xAxis = svg.append('g')
                    .attr('transform', `translate(0,${height - margin.bottom})`)
                    .call(d3.axisBottom(x0));
                  
    let yAxis = svg.append('g')
                    .attr('transform', `translate(${margin.left},0)`)
                    .call(d3.axisLeft(y).ticks(null, "s")); 

                  

    // Add x-axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .text('Platform')
        .attr('text-anchor', 'middle');

    // Add y-axis label
    svg.append('text')
        .attr('x', -height / 2)
        .attr('y', 15)
        .text('Average Likes')
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle');

  // Group container for bars
    const barGroups = svg.selectAll("bar")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.Platform)},0)`);

  // Draw bars
    barGroups.append("rect")
      .attr("x", d => x1(d.PostType))
      .attr("y", d => y(d.LikeAvg))
      .attr("width", x1.bandwidth())
      .attr("height", d => y(0) - y(d.LikeAvg))
      .attr("fill", d => color(d.PostType));
      

    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 64}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {
      legend.append('rect')
          .attr('x', 0)
          .attr('y', i * 20)
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', color(type));

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
      legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 7.5)
          .text(type)
          .attr("alignment-baseline", "middle");
  });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.LikeAvg = +d.LikeAvg;
    });

    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;

    let margin = {
      top:50,
      bottom:75,
      right:30,
      left:50
    }
    // Create the SVG container
    let svg = d3.select('#lineplot')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'cornsilk');

    // Set up scales for x and y axes  
    let yScale = d3.scaleLinear()
                   .domain([0,d3.max(data, d=>d.LikeAvg)])
                   .range([height - margin.bottom, margin.top]);

    let xScale = d3.scaleBand()
                  .domain(data.map(d => d.Date))
                  .range([margin.left, width - margin.right])
                  .padding(0.5);

    // Draw the axis, you can rotate the text in the x-axis here
    let xAxis = svg.append('g')
                  .attr('transform', `translate(0,${height - margin.bottom})`)
                  .call(d3.axisBottom().scale(xScale))
                  .selectAll('text')
                  .style('text-anchor', 'end')
                  .attr('transform', 'rotate(-25)');

    let yAxis = svg.append('g')
                    .attr('transform', `translate(${margin.left},0)`)
                    .call(d3.axisLeft().scale(yScale));

    // Add x-axis label
    svg.append('text')
        .attr('x', width/2)
        .attr('y',height - 10)
        .text('Date');

    // Add y-axis label
    svg.append('text')
        .attr('x', 0-height/2)
        .attr('y', 15)
        .text('Average Likes')
        .attr('transform', 'rotate(-90)');


    // Draw the line and path. Remember to use curveNatural. 
    let line = d3.line()
                  .x(d => xScale(d.Date))
                  .y(d => yScale(d.LikeAvg))
                  .curve(d3.curveNatural);
                  
    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('d', line);
});
