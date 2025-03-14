
class LungLineChart {
    constructor(_parentElement, _lungData) {
        this.parentElement = _parentElement;
        this.lungData = _lungData;

        this.dataByCountry = {};

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 30, right: 20, bottom: 50, left: 60 };
        vis.width = 600 - vis.margin.left - vis.margin.right;
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

        vis.updateLineChart("United States");
    }

    updateLineChart(country) {
        let vis = this;
        const data = vis.dataByCountry[country];
        if (!data) return;

        vis.xScale.domain(d3.extent(data, d => d.year));
        vis.yScale.domain([0, d3.max(data, d => d.rate)]).nice();

        vis.chartG.select(".line-path")
            .datum(data)
            .transition().duration(750)
            .attr("d", vis.lineGen);

        vis.title.text(`Lung Cancer Death Rate - ${country}`);

        vis.xAxisGroup.transition().duration(750)
            .call(d3.axisBottom(vis.xScale).tickFormat(d3.format("d")))
            .selectAll("text").style("fill", "#fff");

        vis.yAxisGroup.transition().duration(750)
            .call(d3.axisLeft(vis.yScale))
            .selectAll("text").style("fill", "#fff");
    }
}
