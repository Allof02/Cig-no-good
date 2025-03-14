
class GlobeVis {
    constructor(_parentElement, _worldData, _validCountries, _lungData, _lineVis1, _lineVis2) {
        this.parentElement = _parentElement;
        this.worldData = _worldData;
        this.validCountries = _validCountries;
        this.lungData = _lungData;
        this.lungLineVis = _lineVis1;
        this.banLineVis = _lineVis2;


        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = 600;
        vis.height = 600;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height);

        vis.projection = d3.geoOrthographic()
            .scale(280)
            .translate([vis.width / 2, vis.height / 2])
            .clipAngle(90);

        vis.path = d3.geoPath().projection(vis.projection);

        vis.graticule = d3.geoGraticule();
        vis.svg.append("path")
            .datum(vis.graticule)
            .attr("class", "graticule")
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("d", vis.path);

        vis.countries = topojson.feature(vis.worldData, vis.worldData.objects.countries).features;

        vis.tooltip = d3.select("#tooltip-2");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.svg.selectAll(".country")
            .data(vis.countries)
            .join("path")
            .attr("class", d => vis.validCountries.has(d.properties.name)
                ? "country highlighted"
                : "country"
            )
            .attr("d", vis.path)
            .on("mouseover", (event, d) => {
                const countryName = d.properties.name;
                if (vis.validCountries.has(countryName)) {
                    vis.tooltip
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px")
                        .style("opacity", 1)
                        .text(countryName)
                        .style("color", "#01515f")
                        .style("font-size", "30px");
                }
            })
            .on("mouseout", () => {
                vis.tooltip.style("opacity", 0);
            })
            .on("click", (event, d) => {
                const countryName = d.properties.name;
                if (vis.validCountries.has(countryName)) {
                    this.lungLineVis.updateLineChart(countryName);
                    if (this.banLineVis){
                    this.banLineVis.updateLineChart(countryName);
                    }
                }
            });

        let rotate = [0, 0];
        vis.svg.call(
            d3.drag().on("drag", (event) => {
                rotate[0] += event.dx * 0.3;
                rotate[1] -= event.dy * 0.3;
                vis.projection.rotate(rotate);
                vis.svg.selectAll("path").attr("d", vis.path);
            })
        );

        const legendItems = [
            { label: "Data available", color: "steelblue" },
            { label: "Data not available", color: "#ccc" }
        ];

        const legendG = vis.svg.append("g")
            .attr("class", "legend-group")
            .attr("transform", `translate(${vis.width - 160}, 0)`);

        legendG.selectAll(".legend-item")
            .data(legendItems)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 25})`)
            .each(function(d) {
                d3.select(this)
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", d.color);

                d3.select(this)
                    .append("text")
                    .attr("x", 25)
                    .attr("y", 14)
                    .style("fill", "#fff")
                    .text(d.label);
            });
    }
}
