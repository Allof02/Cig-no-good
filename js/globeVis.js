
class GlobeVis {
    constructor(_parentElement, _worldData, _validCountries, _lungData, _lineVis1, _lineVis2) {
        this.parentElement = _parentElement;
        this.worldData = _worldData;
        this.validCountries = _validCountries;
        this.lungData = _lungData;
        this.lungLineVis = _lineVis1;
        this.banLineVis = _lineVis2;

        this.selectedCountry = null;
        this.countryData = {};

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

        vis.tooltip = d3.select("#tooltip-2")
            .style("position", "absolute")
            .style("background", "rgba(35, 35, 35, 0.9)")
            .style("border", "1px solid #88e9a3")
            .style("border-radius", "4px")
            .style("padding", "10px")
            .style("color", "#fff")
            .style("font-size", "14px")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("max-width", "250px")
            .style("box-shadow", "0 4px 8px rgba(0,0,0,0.3)");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.countries.forEach(country => {
            const countryName = country.properties.name;

            if (vis.validCountries.has(countryName)) {
                const lungData = vis.lungData.filter(d => d.country === countryName);
                if (lungData.length > 0) {
                    const latestData = lungData.sort((a, b) => b.year - a.year)[0];

                    vis.countryData[countryName] = {
                        latestYear: latestData.year,
                        deathRate: latestData.maleDeathRate
                    };
                }
            }
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        if (!vis.highlightGroup) {
            vis.addSelectionIndicator();
        }

        const countryPaths = vis.svg.selectAll(".country")
            .data(vis.countries)
            .join("path")
            .attr("class", d => {
                const countryName = d.properties.name;
                let classes = "country";
                if (vis.validCountries.has(countryName)) {
                    classes += " highlighted";
                }
                if (countryName === vis.selectedCountry) {
                    classes += " selected";
                }
                return classes;
            })
            .attr("d", vis.path)
            .on("mouseover", (event, d) => {
                const countryName = d.properties.name;
                if (vis.validCountries.has(countryName)) {
                    let tooltipContent = `<div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${countryName}</div>`;

                    if (vis.countryData[countryName]) {
                        const data = vis.countryData[countryName];
                        tooltipContent += `
                        <div style="font-size: 13px; margin-bottom: 3px;">
                            <span style="color: #88e9a3;">Death rate:</span> 
                            ${data.deathRate.toFixed(1)} per 100,000 (${data.latestYear})
                        </div>`;
                    }

                    tooltipContent += `<div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">Click to view detailed trends</div>`;

                    vis.tooltip
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px")
                        .style("opacity", 1)
                        .html(tooltipContent);

                    d3.select(event.target)
                        .style("stroke", "#ffec00")
                        .style("stroke-width", 1.5);
                }
            })
            .on("mouseout", (event) => {
                vis.tooltip.style("opacity", 0);

                d3.select(event.target)
                    .style("stroke", d => d.properties.name === vis.selectedCountry ? "#ffec00" : "#333")
                    .style("stroke-width", d => d.properties.name === vis.selectedCountry ? 1.5 : 0.5);
            })
            .on("click", (event, d) => {
                const countryName = d.properties.name;
                if (vis.validCountries.has(countryName)) {
                    vis.selectedCountry = countryName;

                    this.lungLineVis.updateLineChart(countryName);
                    if (this.banLineVis) {
                        this.banLineVis.updateLineChart(countryName);
                    }

                    vis.svg.selectAll(".country")
                        .style("stroke", d => d.properties.name === countryName ? "#ffec00" : "#333")
                        .style("stroke-width", d => d.properties.name === countryName ? 1.5 : 0.5);

                    const centroid = vis.path.centroid(d);
                    if (isFinite(centroid[0]) && isFinite(centroid[1])) {
                        vis.updateSelectionIndicator(countryName, centroid);
                    }
                }
            });

        countryPaths
            .style("fill", d => vis.validCountries.has(d.properties.name) ? "steelblue" : "#ccc")
            .style("stroke", d => d.properties.name === vis.selectedCountry ? "#ffec00" : "#333")
            .style("stroke-width", d => d.properties.name === vis.selectedCountry ? 1.5 : 0.5);

        let rotate = [0, 0];
        vis.svg.call(
            d3.drag().on("drag", (event) => {
                rotate[0] += event.dx * 0.3;
                rotate[1] -= event.dy * 0.3;
                vis.projection.rotate(rotate);
                vis.svg.selectAll("path").attr("d", vis.path);

                // force raise the top layer during rotation to ensure it's always on top
                if (vis.topLayer) {
                    vis.topLayer.raise();
                }

                if (vis.selectedCountry) {
                    const selectedCountry = vis.countries.find(d => d.properties.name === vis.selectedCountry);
                    if (selectedCountry) {
                        const centroid = vis.path.centroid(selectedCountry);
                        const isVisible = isFinite(centroid[0]) && isFinite(centroid[1]);

                        if (isVisible) {
                            vis.highlightGroup
                                .attr("transform", `translate(${centroid[0]}, ${centroid[1]})`)
                                .style("opacity", 1);
                        } else {
                            vis.highlightGroup.style("opacity", 0);
                        }
                    }
                }
            })
        );

        vis.svg.selectAll(".legend-group").remove();

        const legendItems = [
            { label: "Data available", color: "steelblue", class: "data-available" },
            { label: "Data not available", color: "#ccc", class: "no-data" },
            { label: "Selected country", color: "#ffec00", class: "selected-country" }
        ];

        const legendG = vis.svg.append("g")
            .attr("class", "legend-group")
            .attr("transform", `translate(${vis.width - 160}, 10)`);

        legendG.append("rect")
            .attr("width", 150)
            .attr("height", 90)
            .attr("fill", "rgba(35, 35, 35, 0.7)")
            .attr("rx", 4);

        legendG.selectAll(".legend-item")
            .data(legendItems)
            .enter()
            .append("g")
            .attr("class", d => `legend-item ${d.class}`)
            .attr("transform", (d, i) => `translate(10, ${i * 25 + 15})`)
            .each(function(d) {
                if (d.class === "selected-country") {
                    d3.select(this)
                        .append("circle")
                        .attr("r", 6)
                        .attr("cx", 6)
                        .attr("cy", 0)
                        .style("fill", "steelblue")
                        .style("stroke", d.color)
                        .style("stroke-width", 2);
                } else {
                    d3.select(this)
                        .append("rect")
                        .attr("width", 12)
                        .attr("height", 12)
                        .attr("y", -6)
                        .style("fill", d.color);
                }

                d3.select(this)
                    .append("text")
                    .attr("x", 20)
                    .attr("y", 4)
                    .style("fill", "#fff")
                    .style("font-size", "12px")
                    .text(d.label);
            });

        vis.svg.append("text")
            .attr("class", "instruction-text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height - 20)
            .attr("text-anchor", "middle")
            .style("fill", "#fff")
            .style("font-size", "12px")
            .style("font-style", "italic");
            //.text("Drag to rotate globe | Click on a country to view data");

        if (vis.topLayer) {
            vis.topLayer.raise();
        }
    }

    addSelectionIndicator() {
        let vis = this;

        vis.svg.selectAll(".selection-indicator").remove();


        vis.topLayer = vis.svg.append("g")
            .attr("class", "globe-top-layer").style("pointer-events", "none");

        vis.highlightGroup = vis.topLayer.append("g")
            .attr("class", "selection-indicator")
            .style("opacity", 0);

        vis.highlightGroup.append("circle")
            .attr("r", 15)
            .attr("fill", "none")
            .attr("stroke", "#ffec00")
            .attr("stroke-width", 2)
            .attr("class", "pulse-circle");


        vis.highlightGroup.append("circle")
            .attr("r", 4)
            .attr("fill", "#ffec00");

        vis.highlightGroup.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 40)
            .attr("y2", -40)
            .attr("stroke", "#ffec00")
            .attr("stroke-width", 1);

        vis.highlightGroup.append("rect")
            .attr("x", 45)
            .attr("y", -60)
            .attr("width", 100)
            .attr("height", 25)
            .attr("fill", "rgba(35, 35, 35, 0.7)")
            .attr("rx", 4);

        vis.highlightGroup.append("text")
            .attr("x", 95)
            .attr("y", -42)
            .attr("text-anchor", "middle")
            .attr("fill", "#ffec00")
            .attr("font-weight", "bold")
            .attr("font-size", "12px")
            .text("");
    }


    updateSelectionIndicator(country, centroid) {
        let vis = this;

        if (!country) {
            vis.highlightGroup.style("opacity", 0);
            return;
        }

        const isVisible = isFinite(centroid[0]) && isFinite(centroid[1]);

        if (!isVisible) {
            vis.highlightGroup.style("opacity", 0);
            return;
        }

        vis.topLayer.raise();

        vis.highlightGroup
            .attr("transform", `translate(${centroid[0]}, ${centroid[1]})`)
            .style("opacity", 1);

        vis.highlightGroup.select("text")
            .text(country);

        vis.highlightGroup.select(".pulse-circle")
            .attr("r", 8)
            .attr("opacity", 1)
            .transition()
            .duration(1500)
            .attr("r", 25)
            .attr("opacity", 0)
            .on("end", function() {
                if (vis.selectedCountry === country && isVisible) {
                    d3.select(this)
                        .attr("r", 8)
                        .attr("opacity", 1)
                        .transition()
                        .duration(1500)
                        .attr("r", 25)
                        .attr("opacity", 0)
                        .on("end", function() {
                            if (vis.selectedCountry === country && isVisible) {
                                vis.updateSelectionIndicator(country, centroid);
                            }
                        });
                }
            });
    }


}
