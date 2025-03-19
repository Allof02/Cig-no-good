
class LungLineChart {
    constructor(_parentElement, _lungData) {
        this.parentElement = _parentElement;
        this.lungData = _lungData;

        this.dataByCountry = {};

        this.initVis();

        window.myLungLineChart = this;
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 30, right: 20, bottom: 50, left: 60 };
        vis.width = 560 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width",  vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.chartG = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.lungData.forEach(d => {
            if (!vis.dataByCountry[d.country]) {
                vis.dataByCountry[d.country] = [];
            }
            // only push valid numeric
            if (!isNaN(d.maleDeathRate)) {
                vis.dataByCountry[d.country].push({
                    year: d.year,
                    rate: d.maleDeathRate
                });
            }
        });

        // xScale
        vis.xScale = d3.scaleLinear()
            .domain(d3.extent(vis.lungData, d => d.year))
            .range([0, vis.width]);

        // yScale
        vis.yScale = d3.scaleLinear()
            .domain([0, d3.max(vis.lungData, d => d.maleDeathRate)])
            .range([vis.height, 0]);

        // Axes
        vis.xAxisGroup = vis.chartG.append("g")
            .attr("transform", `translate(0, ${vis.height})`);
        vis.yAxisGroup = vis.chartG.append("g");

        // Title
        vis.title = vis.chartG.append("text")
            .attr("id", "countries-title")
            .attr("x", vis.width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .text("Lung Cancer Death Rates Over Time - ???")
            .style("fill", "white");

        // Line generator
        vis.lineGen = d3.line()
            .x(d => vis.xScale(d.year))
            .y(d => vis.yScale(d.rate));

        vis.chartG.append("path")
            .attr("class", "line-path")
            .style("fill", "none")
            .style("stroke", "#88e9a3")
            .style("stroke-width", 2);

        vis.chartG.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -vis.margin.left + 15)
            .attr("x", -vis.height / 2)
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .text("Deaths per 100,000 people");

        this.addInteractiveElements();
        vis.updateLineChart("United States");
    }

    updateLineChart(country) {
        let vis = this;
        const data = vis.dataByCountry[country];
        if (!data) return;

        vis.xScale.domain(d3.extent(data, d => d.year));
        vis.yScale.domain([0, d3.max(data, d => d.rate)]).nice();

        // Update line
        vis.chartG.select(".line-path")
            .datum(data)
            .transition().duration(750)
            .attr("d", vis.lineGen);

        // Update title
        vis.title.text(`Lung Cancer Death Rate - ${country}`);

        // Update axes
        vis.xAxisGroup.transition().duration(750)
            .call(d3.axisBottom(vis.xScale).tickFormat(d3.format("d")))
            .selectAll("text").style("fill", "#fff");

        vis.yAxisGroup.transition().duration(750)
            .call(d3.axisLeft(vis.yScale))
            .selectAll("text").style("fill", "#fff");

        // Update data points
        let dataPoints = vis.dataPointsGroup.selectAll(".data-point")
            .data(data);

        dataPoints.exit().remove();

        dataPoints.enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("r", 4)
            .attr("fill", "#88e9a3")
            .merge(dataPoints)
            .transition().duration(750)
            .attr("cx", d => vis.xScale(d.year))
            .attr("cy", d => vis.yScale(d.rate));

        // Add country information card
        vis.chartG.selectAll(".country-card").remove();

        // vis.chartG.append("g")
        //     .attr("class", "country-card")
        //     .attr("transform", `translate(${vis.width - 160}, 10)`)
        //     .call(g => {
        //         g.append("rect")
        //             .attr("width", 150)
        //             .attr("height", 60)
        //             .attr("fill", "rgba(35, 35, 35, 0.7)")
        //             .attr("stroke", "#88e9a3")
        //             .attr("stroke-width", 1)
        //             .attr("rx", 4);
        //
        //         g.append("text")
        //             .attr("x", 10)
        //             .attr("y", 20)
        //             .style("fill", "#fff")
        //             .style("font-weight", "bold")
        //             .text(country);
        //
        //         // Get trend information
        //         // if (data.length > 1) {
        //         //     const firstPoint = data[0];
        //         //     const lastPoint = data[data.length - 1];
        //         //     const change = lastPoint.rate - firstPoint.rate;
        //         //     const percentChange = (change / firstPoint.rate) * 100;
        //         //
        //         //     const trendSymbol = change > 0 ? "▲" : "▼";
        //         //     const trendColor = change > 0 ? "#ff7a7a" : "#7aff7a";
        //         //
        //         //     g.append("text")
        //         //         .attr("x", 10)
        //         //         .attr("y", 40)
        //         //         .style("fill", trendColor)
        //         //         .style("font-size", "12px")
        //         //         .text(`${trendSymbol} ${Math.abs(percentChange).toFixed(1)}% since ${firstPoint.year}`);
        //         // }
        //     });
    }

    resetHighlight() {
        let vis = this;
        vis.guideLine.style("opacity", 0);
        vis.dataPointsGroup.selectAll(".data-point")
            .attr("r", 4)
            .attr("stroke", "none");
    }

    highlightYear(year) {
        let vis = this;
        const closestPoint = vis.dataPointsGroup.selectAll(".data-point").data()
            .reduce((prev, curr) => {
                return Math.abs(curr.year - year) < Math.abs(prev.year - year) ? curr : prev;
            }, { year: Infinity, rate: 0 });

        vis.guideLine
            .attr("x1", vis.xScale(closestPoint.year))
            .attr("x2", vis.xScale(closestPoint.year))
            .style("opacity", 1);

        vis.dataPointsGroup.selectAll(".data-point")
            .attr("r", 4)
            .attr("stroke", "none");

        vis.dataPointsGroup.selectAll(".data-point")
            .filter(d => d.year === closestPoint.year)
            .attr("r", 7)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);
    }

    addInteractiveElements() {
        let vis = this;

        vis.guideLine = vis.chartG.append("line")
            .attr("class", "lung-guide-line")
            .attr("y1", 0)
            .attr("y2", vis.height)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
            .style("opacity", 0)
            .style("pointer-events", "none");

        vis.dataPointsGroup = vis.chartG.append("g")
            .attr("class", "data-points");

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "lung-chart-tooltip")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("background", "rgba(35, 35, 35, 0.9)")
            .style("border", "1px solid #88e9a3")
            .style("border-radius", "4px")
            .style("padding", "12px")
            .style("box-shadow", "0 4px 8px rgba(0,0,0,0.3)")
            .style("color", "#fff")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", "1000");

        vis.overlay = vis.chartG.append("rect")
            .attr("class", "overlay")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .style("fill", "none")
            .style("pointer-events", "all");

        vis.overlay
            .on("mouseover", function() {
                vis.guideLine.style("opacity", 1);
            })
            .on("mouseout", function() {
                vis.guideLine.style("opacity", 0);
                vis.tooltip.style("opacity", 0);

                vis.dataPointsGroup.selectAll(".data-point")
                    .attr("r", 4)
                    .attr("stroke", "none");

                if (window.myBanLineChart && vis !== window.myBanLineChart) {
                    window.myBanLineChart.resetHighlight();
                }
                if (window.myLungLineChart && vis !== window.myLungLineChart) {
                    window.myLungLineChart.resetHighlight();
                }
            })
            .on("mousemove", function(event) {
                const mouseX = d3.pointer(event)[0];
                const year = Math.round(vis.xScale.invert(mouseX));

                const currentData = vis.dataPointsGroup.selectAll(".data-point").data();
                const closestPoint = currentData.reduce((prev, curr) => {
                    return Math.abs(curr.year - year) < Math.abs(prev.year - year) ? curr : prev;
                }, { year: Infinity, rate: 0 });

                vis.guideLine
                    .attr("x1", vis.xScale(closestPoint.year))
                    .attr("x2", vis.xScale(closestPoint.year));

                if (vis.constructor.name === "LungLineChart") {
                    vis.tooltip.html(`
                    <div style="font-size: 14px; font-weight: bold; color: #88e9a3; margin-bottom: 4px;">
                        ${closestPoint.year}
                    </div>
                    <div style="font-size: 16px; margin-bottom: 2px;">
                        <span style="font-weight: bold;">${closestPoint.rate.toFixed(1)}</span> 
                        <span style="font-size: 12px; opacity: 0.8;">deaths per 100,000</span>
                    </div>
                `);
                } else {
                    let banDescription = "";
                    switch(Math.round(closestPoint.level)) {
                        case 1: banDescription = "Data not reported"; break;
                        case 2: banDescription = "Complete absence of ban"; break;
                        case 3: banDescription = "Ban on national TV, radio, and print only"; break;
                        case 4: banDescription = "Ban on most forms of direct/indirect advertising"; break;
                        case 5: banDescription = "Ban on all forms of direct and indirect advertising"; break;
                        default: banDescription = "Unknown level";
                    }

                    vis.tooltip.html(`
                    <div style="font-size: 14px; font-weight: bold; color: #d4bbee; margin-bottom: 4px;">
                        ${closestPoint.year}
                    </div>
                    <div style="font-size: 16px; margin-bottom: 2px;">
                        <span style="font-weight: bold;">Level ${closestPoint.level}</span>
                    </div>
                    <div style="font-size: 11px; opacity: 0.9;">
                        ${banDescription}
                    </div>
                `);
                }

                vis.tooltip
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 15) + "px")
                    .style("opacity", 1);

                vis.dataPointsGroup.selectAll(".data-point")
                    .attr("r", 4)
                    .attr("stroke", "none");

                vis.dataPointsGroup.selectAll(".data-point")
                    .filter(d => d.year === closestPoint.year)
                    .attr("r", 7)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 2);

                if (window.myBanLineChart && vis !== window.myBanLineChart) {
                    window.myBanLineChart.highlightYear(closestPoint.year);
                }
                if (window.myLungLineChart && vis !== window.myLungLineChart) {
                    window.myLungLineChart.highlightYear(closestPoint.year);
                }
            });
    }

}
