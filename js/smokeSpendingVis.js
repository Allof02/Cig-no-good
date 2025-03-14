
class SmokingSpendingChart {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 80, right: 250, bottom: 50, left: 60 };
        vis.width  = 1000 - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top  - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width",  vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.chartG = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.y0 = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.y1 = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxisGroup = vis.chartG.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.y0AxisGroup = vis.chartG.append("g")
            .attr("class", "y-axis-left");

        vis.y1AxisGroup = vis.chartG.append("g")
            .attr("class", "y-axis-right")
            .attr("transform", `translate(${vis.width}, 0)`);

        // axis labels
        vis.chartG.append("text")
            .attr("class", "axis-label-left")
            .attr("x", -vis.margin.left + 15)
            .attr("y", -10)
            .style("fill", "#fff")
            .style("font-weight", "bold")
            .text("Spending (£)");

        vis.chartG.append("text")
            .attr("class", "axis-label-right")
            .attr("x", vis.width + 40)
            .attr("y", -10)
            .attr("text-anchor", "end")
            .style("fill", "#fff")
            .style("font-weight", "bold")
            .text("Percentage of Total (%)");

        vis.chartG.append("text")
            .attr("class", "axis-label-bottom")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .attr("text-anchor", "middle")
            .style("fill", "#fff")
            .style("font-weight", "bold")
            .text("Year");


        vis.lineSpending = d3.line()
            .x(d => vis.x(d.Year))
            .y(d => vis.y0(d.HouseholdTobacco))
            .curve(d3.curveMonotoneX);

        vis.linePercent = d3.line()
            .x(d => vis.x(d.Year))
            .y(d => vis.y1(d.TobaccoPercent))
            .curve(d3.curveMonotoneX);

        vis.spendingPath = vis.chartG.append("path")
            .attr("fill", "none")
            .attr("stroke", "#c888f3")
            .attr("stroke-width", 2);

        vis.percentPath = vis.chartG.append("path")
            .attr("fill", "none")
            .attr("stroke", "#88e9a3")
            .attr("stroke-width", 2);

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip spending-tooltip")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("background", "rgba(0,0,0,0.7)")
            .style("color", "#fff")
            .style("padding", "8px")
            .style("border-radius", "4px");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.data;

        vis.displayData.sort((a,b) => a.Year - b.Year);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.x.domain(d3.extent(vis.displayData, d => d.Year));

        vis.y0.domain([0, d3.max(vis.displayData, d => d.HouseholdTobacco)]).nice();
        vis.y1.domain([0, d3.max(vis.displayData, d => d.TobaccoPercent)]).nice();

        vis.spendingPath
            .datum(vis.displayData)
            .transition().duration(600)
            .attr("d", vis.lineSpending);

        vis.percentPath
            .datum(vis.displayData)
            .transition().duration(600)
            .attr("d", vis.linePercent);

        vis.xAxisGroup
            .transition().duration(600)
            .call(d3.axisBottom(vis.x).tickFormat(d3.format("d")));

        vis.y0AxisGroup
            .transition().duration(600)
            .call(d3.axisLeft(vis.y0).ticks(5));

        vis.y1AxisGroup
            .transition().duration(600)
            .call(d3.axisRight(vis.y1).ticks(5).tickFormat(d => d + "%"));

        let spendingDots = vis.chartG.selectAll(".dot-spending")
            .data(vis.displayData, d => d.Year);

        spendingDots.exit().remove();

        let spendingDotsEnter = spendingDots.enter().append("circle")
            .attr("class", "dot-spending")
            .attr("r", 4)
            .attr("fill", "#c888f3")
            .on("mouseover", function(event, d) {
                vis.tooltip
                    .style("opacity", 1)
                    .html(`
            <strong>Year:</strong> ${d.Year}<br/>
            <strong>£${d.HouseholdTobacco.toLocaleString()}</strong>
          `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top",  (event.pageY - 28) + "px");
                d3.select(this).transition().attr("r", 7);
            })
            .on("mouseout", function() {
                vis.tooltip.style("opacity", 0);
                d3.select(this).transition().attr("r", 4);
            });

        spendingDotsEnter.merge(spendingDots)
            .transition().duration(600)
            .attr("cx", d => vis.x(d.Year))
            .attr("cy", d => vis.y0(d.HouseholdTobacco));

        let percentDots = vis.chartG.selectAll(".dot-percent")
            .data(vis.displayData, d => d.Year);

        percentDots.exit().remove();

        let percentDotsEnter = percentDots.enter().append("circle")
            .attr("class", "dot-percent")
            .attr("r", 4)
            .attr("fill", "#88e9a3")
            .on("mouseover", function(event, d) {
                vis.tooltip
                    .style("opacity", 1)
                    .html(`
            <strong>Year:</strong> ${d.Year}<br/>
            <strong>${d.TobaccoPercent}%</strong>
          `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top",  (event.pageY - 28) + "px");
                d3.select(this).transition().attr("r", 7);
            })
            .on("mouseout", function() {
                vis.tooltip.style("opacity", 0);
                d3.select(this).transition().attr("r", 4);
            });

        percentDotsEnter.merge(percentDots)
            .transition().duration(600)
            .attr("cx", d => vis.x(d.Year))
            .attr("cy", d => vis.y1(d.TobaccoPercent));

        let legendData = [
            { label: "Tobacco Spending (£)", color: "#c888f3" },
            { label: "Tobacco % of Total", color: "#88e9a3" }
        ];

        vis.chartG.selectAll(".legend-group").remove();

        let legendGroup = vis.chartG.append("g")
            .attr("class", "legend-group")
            .attr("transform", `translate(${vis.width + 60}, 10)`);

        legendGroup.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d,i) => `translate(0, ${i*25})`)
            .each(function(d) {
                d3.select(this).append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 20)
                    .attr("height", 3)
                    .attr("fill", d.color);

                d3.select(this).append("text")
                    .attr("x", 30)
                    .attr("y", 5)
                    .style("fill", "#fff")
                    .text(d.label);
            });
    }
}
