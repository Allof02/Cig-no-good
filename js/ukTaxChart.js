
class TaxChart {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;


        this.initVis();
    }

    initVis() {
        let vis = this;


        vis.margin = { top: 30, right: 20, bottom: 40, left: 60 };
        vis.width  = 600 - vis.margin.left - vis.margin.right;
        vis.height = 300 - vis.margin.top  - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width",  vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);


        vis.svg.append("text")
            .attr("class", "chart-title")
            .attr("x", vis.width / 2)
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .style("fill", "#fff")
            .text("Specific Tax (£ per 1,000 sticks)");


        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]).nice();


        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "axis x-axis-tax")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "axis y-axis-tax");


        vis.line = d3.line()
            .x(d => vis.x(d.date))
            .y(d => vis.y(d.SpecificTax))
            .curve(d3.curveMonotoneX);


        vis.chartLine = vis.svg.append("path")
            .attr("class", "tax-line")
            .style("fill", "none")
            .style("stroke", "#d4bbee")
            .style("stroke-width", 2);


        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tax-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "rgba(35, 35, 35, 0.9)")
            .style("border", "1px solid #88a2bc")
            .style("border-radius", "4px")
            .style("padding", "12px")
            .style("box-shadow", "0 4px 8px rgba(0,0,0,0.3)")
            .style("color", "#fff")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", "1000")
            .style("max-width", "200px")
            .style("transition", "opacity 0.2s ease-in-out");



        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;


        if (selectedTimeRange.length === 2) {
            const [minDate, maxDate] = selectedTimeRange;
            vis.displayData = vis.data.filter(d => d.date >= minDate && d.date <= maxDate);
        } else {
            vis.displayData = vis.data;
        }

        vis.displayData.sort((a,b) => a.date - b.date);


        vis.updateVis();
    }

    updateVis() {
        let vis = this;


        vis.x.domain(d3.extent(vis.displayData, d => d.date));
        vis.y.domain([0, d3.max(vis.displayData, d => d.SpecificTax)]);


        vis.chartLine
            .datum(vis.displayData)
            .transition().duration(600)
            .attr("d", vis.line);


        let dots = vis.svg.selectAll(".tax-dot")
            .data(vis.displayData, d => d.date);


        dots.exit().remove();


        let dotsEnter = dots.enter().append("circle")
            .attr("class", "tax-dot")
            .attr("fill", "#d4bbee")
            .attr("r", 4)
            .on("mouseover", function(event, d) {
                // get the previous year's data for comparison (if available)
                let prevYearData = null;
                const currentIndex = vis.displayData.findIndex(item => item.Year === d.Year);
                if (currentIndex > 0) {
                    prevYearData = vis.displayData[currentIndex - 1];
                }

                // calculate percentage change if we have previous year data
                let changeInfo = "";
                if (prevYearData) {
                    const change = d.SpecificTax - prevYearData.SpecificTax;
                    const percentChange = (change / prevYearData.SpecificTax) * 100;

                    // format the change information with appropriate icons and colors
                    const changeDirection = change >= 0 ? "▲" : "▼";
                    const changeColor = change >= 0 ? "#ff7a7a" : "#7aff7a";

                    changeInfo = `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">
                <span style="color: ${changeColor}; font-weight: bold;">${changeDirection} ${Math.abs(percentChange).toFixed(1)}%</span> 
                from ${prevYearData.Year}
            </div>
        `;
                }

                vis.tooltip
                    .html(`
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: #d4bbee;">
                ${d.Year}
            </div>
            <div style="font-size: 16px; margin-bottom: 2px;">
                <span style="font-weight: bold;">£${d.SpecificTax.toFixed(2)}</span> 
                <span style="font-size: 12px; opacity: 0.8;">per 1,000 sticks</span>
            </div>
            ${changeInfo}
        `)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 15) + "px")
                    .transition()
                    .duration(200)
                    .style("opacity", 1);

                // highlight the current dot
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 7)
                    .attr("fill", "#ffec00")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 2);

                vis.svg.append("line")
                    .attr("class", "reference-line")
                    .attr("x1", vis.x(d.date))
                    .attr("x2", vis.x(d.date))
                    .attr("y1", 0)
                    .attr("y2", vis.height)
                    .attr("stroke", "rgba(255, 255, 255, 0.3)")
                    .attr("stroke-width", 1)
                    .attr("stroke-dasharray", "3,3");
            })
            .on("mouseout", function() {
                vis.tooltip
                    .transition()
                    .duration(300)
                    .style("opacity", 0);

                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr("r", 4)
                    .attr("fill", "#d4bbee")
                    .attr("stroke", "none");

                vis.svg.selectAll(".reference-line").remove();
            });


        dotsEnter.merge(dots)
            .transition().duration(600)
            .attr("cx", d => vis.x(d.date))
            .attr("cy", d => vis.y(d.SpecificTax));


        vis.xAxisGroup
            .transition().duration(600)
            .call(d3.axisBottom(vis.x).ticks(5)).selectAll("text").style("fill", "#fff");

        vis.yAxisGroup
            .transition().duration(600)
            .call(d3.axisLeft(vis.y)).selectAll("text").style("fill", "#fff");
    }
}
