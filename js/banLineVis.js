
class BanLineChart {
    constructor(_parentElement, _banData) {
        this.parentElement = _parentElement;
        this.banData = _banData;
        this.dataByCountry = {};

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 30, right: 20, bottom: 50, left: 60 };
        vis.width = 600 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        // SVG
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width",  vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.chartG = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.banData.forEach(d => {
            if (!vis.dataByCountry[d.country]) {
                vis.dataByCountry[d.country] = [];
            }
            if (!isNaN(d.banLevel)) {
                vis.dataByCountry[d.country].push({
                    year: d.year,
                    level: d.banLevel
                });
            }
        });

        // x-scale
        vis.xScale = d3.scaleLinear()
            .domain(d3.extent(vis.banData, d => d.year))
            .range([0, vis.width]);

        // y-scale
        vis.yScale = d3.scaleLinear()
            .domain([0, d3.max(vis.banData, d => d.banLevel)])
            .range([vis.height, 0]);

        // Axes
        vis.xAxisGroup = vis.chartG.append("g")
            .attr("transform", `translate(0, ${vis.height})`);
        vis.yAxisGroup = vis.chartG.append("g");

        // Title
        vis.title = vis.chartG.append("text")
            .attr("id", "countries-title-ban")
            .attr("x", vis.width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .text("Level of Tobacco Advertising Ban Over Time - ???");

        // Line generator
        vis.lineGen = d3.line()
            .x(d => vis.xScale(d.year))
            .y(d => vis.yScale(d.level));

        vis.chartG.append("path")
            .attr("class", "ban-line-path")
            .style("fill", "none")
            .style("stroke", "#d4bbee")
            .style("stroke-width", 2);

        vis.chartG.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -vis.margin.left + 15)
            .attr("x", -vis.height / 2)
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .text("Ban Level");

        vis.updateLineChart("United States");
    }

    updateLineChart(country) {
        let vis = this;
        const data = vis.dataByCountry[country];
        if (!data) return;

        vis.xScale.domain(d3.extent(data, d => d.year));
        vis.yScale.domain([0, d3.max(data, d => d.level)]).nice();

        vis.chartG.select(".ban-line-path")
            .datum(data)
            .transition().duration(750)
            .attr("d", vis.lineGen);

        vis.title.text(`Ban Level - ${country}`);

        vis.xAxisGroup
            .transition().duration(750)
            .call(d3.axisBottom(vis.xScale).tickFormat(d3.format("d")))
            .selectAll("text").style("fill", "#fff");

        vis.yAxisGroup
            .transition().duration(750)
            .call(d3.axisLeft(vis.yScale))
            .selectAll("text").style("fill", "#fff");
    }
}
