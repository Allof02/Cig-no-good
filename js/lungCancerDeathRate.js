// Promise.all([
//     d3.json("data/world-110m.json"),
//     d3.csv("data/lung-cancer-deaths-per-100000-by-sex-1950-2002.csv", d => ({
//         country: d.Entity,
//         code: d.Code,
//         year: +d.Year,
//         maleDeathRate: +d["Age-standardized deaths from trachea, bronchus, lung cancers in males in those aged all ages per 100,000 people"]
//     })),
//     d3.csv("data/enforcement-of-bans-on-tobacco-advertising.csv", d => ({
//         country: d.Entity,
//         code: d.Code,
//         year: +d.Year,
//         banLevel: +d["Enforce bans on tobacco advertising"]
//     }))
// ]).then(([worldData, lungData, banData]) => {
//     const validCountries = new Set(lungData.map(d => d.country));
//
//
//     initGlobe(worldData, validCountries, lungData);
//     let mySection4LungLineChart = new LungLineChart("chart-lung", lungData);
// }).catch(err => console.error(err));
//
//
// function initGlobe(worldData, validCountries, lungData) {
//     const width = 600, height = 600;
//
//
//     const svg = d3.select("#globe")
//         .append("svg")
//         .attr("width", width)
//         .attr("height", height);
//
//     const projection = d3.geoOrthographic()
//         .scale(280)
//         .translate([width / 2, height / 2])
//         .clipAngle(90);
//
//     const path = d3.geoPath().projection(projection);
//
//     const countries = topojson.feature(worldData, worldData.objects.countries).features;
//
//     const graticule = d3.geoGraticule();
//     svg.append("path")
//         .datum(graticule)
//         .attr("class", "graticule")
//         .attr("fill", "none")
//         .attr("stroke", "#ccc")
//         .attr("d", path);
//
//
//     // Tooltip
//     const tooltip = d3.select("#tooltip");
//
//
//     svg.selectAll(".country")
//         .data(countries)
//         .enter()
//         .append("path")
//         .attr("class", d => validCountries.has(d.properties.name) ? "country highlighted" : "country")
//         .attr("d", path)
//         .on("mouseover", (event, d) => {
//             const countryName = d.properties.name;
//             if (validCountries.has(countryName)) {
//                 tooltip
//                     .style("left", event.pageX + 10 + "px")
//                     .style("top", event.pageY - 28 + "px")
//                     .style("opacity", 1)
//                     .text(countryName).style("color", "#01515f").style("font-size", "30px");
//             }
//
//         })
//         .on("mouseout", () => {
//             tooltip.style("opacity", 0);
//         })
//         .on("click", (event, d) => {
//             const countryName = d.properties.name;
//             if (validCountries.has(countryName)) {
//                 updateLineChart(countryName);
//             }
//         });
//
//     let rotate = [0, 0];
//     svg.call(
//         d3.drag().on("drag", (event) => {
//             rotate[0] += event.dx * 0.3;
//             rotate[1] -= event.dy * 0.3;
//             projection.rotate(rotate);
//             svg.selectAll("path").attr("d", path);
//         })
//     );
//
//     //legend
//     const legendItems = [
//         { label: "Data available", color: "steelblue" },
//         { label: "Data not available", color: "#ccc" }
//     ];
//
//
//     const legendG = svg.append("g")
//         .attr("class", "legend-group")
//
//         .attr("transform", `translate(${width-160}, 0)`);
//
//
//     legendG.selectAll(".legend-item")
//         .data(legendItems)
//         .enter()
//         .append("g")
//         .attr("class", "legend-item")
//         .attr("transform", (d, i) => `translate(0, ${i * 25})`)
//         .each(function(d) {
//             d3.select(this)
//                 .append("rect")
//                 .attr("x", 0)
//                 .attr("y", 0)
//                 .attr("width", 18)
//                 .attr("height", 18)
//                 .style("fill", d.color);
//
//             d3.select(this)
//                 .append("text")
//                 .attr("x", 25)
//                 .attr("y", 14)
//                 .style("fill", "#fff")
//                 .text(d.label);
//         });
// }
//
//
