
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
            .attr("class", "tooltip tax-tooltip")
            .style("opacity", 0);


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
                vis.tooltip.transition().style("opacity", 1);
                vis.tooltip.html(`
                    <strong>Year: ${d.Year}</strong><br/>
                    £${d.SpecificTax.toFixed(2)} / 1000
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top",  (event.pageY - 28) + "px");

                d3.select(this).transition().attr("r", 7).attr("fill", "#ffec00");
            })
            .on("mouseout", function() {
                vis.tooltip.transition().style("opacity", 0);
                d3.select(this).transition().attr("r", 4).attr("fill", "#d4bbee");
            });


        dotsEnter.merge(dots)
            .transition().duration(600)
            .attr("cx", d => vis.x(d.date))
            .attr("cy", d => vis.y(d.SpecificTax));


        vis.xAxisGroup
            .transition().duration(600)
            .call(d3.axisBottom(vis.x).ticks(5));

        vis.yAxisGroup
            .transition().duration(600)
            .call(d3.axisLeft(vis.y));
    }
}
