Promise.all([
    d3.json("data/world-110m.json"), // TopoJSON file
    d3.csv("data/lung-cancer-deaths-per-100000-by-sex-1950-2002.csv", d => ({
        country: d.Entity,
        code: d.Code,
        year: +d.Year,
        maleDeathRate: +d["Age-standardized deaths from trachea, bronchus, lung cancers in males in those aged all ages per 100,000 people"]
    }))
]).then(([worldData, lungData]) => {
    // Create a set of valid countries from the CSV
    const validCountries = new Set(lungData.map(d => d.country));

    // Initialize both the globe and chart
    initGlobe(worldData, validCountries, lungData);
    initLineChart(lungData);
}).catch(err => console.error(err));

/***********************************************************************
 * 2) GLOBE SETUP
 ***********************************************************************/
function initGlobe(worldData, validCountries, lungData) {
    const width = 600, height = 600;

    // Create SVG for the globe
    const svg = d3.select("#globe")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoOrthographic()
        .scale(280)
        .translate([width / 2, height / 2])
        .clipAngle(90);

    const path = d3.geoPath().projection(projection);

    const countries = topojson.feature(worldData, worldData.objects.countries).features;

    const graticule = d3.geoGraticule();
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("d", path);


    // Tooltip
    const tooltip = d3.select("#tooltip");

    // Draw the countries on the globe
    svg.selectAll(".country")
        .data(countries)
        .enter()
        .append("path")
        .attr("class", d => validCountries.has(d.properties.name) ? "country highlighted" : "country")
        .attr("d", path)
        .on("mouseover", (event, d) => {
            const countryName = d.properties.name;
            if (validCountries.has(countryName)) {
                tooltip
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 28 + "px")
                    .style("opacity", 1)
                    .text(countryName);
            }
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        })
        .on("click", (event, d) => {
            const countryName = d.properties.name;
            if (validCountries.has(countryName)) {
                updateLineChart(countryName);
            }
        });

    // Optional: Make the globe draggable
    let rotate = [0, 0];
    svg.call(
        d3.drag().on("drag", (event) => {
            rotate[0] += event.dx * 0.3;
            rotate[1] -= event.dy * 0.3;
            projection.rotate(rotate);
            svg.selectAll("path").attr("d", path);
        })
    );
}

/***********************************************************************
 * 3) LINE CHART SETUP
 ***********************************************************************/
let dataByCountry = {};
let xScale, yScale, line, xAxis, yAxis;

function initLineChart(lungData) {
    const margin = { top: 30, right: 20, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const chartG = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Organize data by country
    lungData.forEach(d => {
        if (!dataByCountry[d.country]) {
            dataByCountry[d.country] = [];
        }
        if (!isNaN(d.maleDeathRate)) {
            dataByCountry[d.country].push({ year: d.year, rate: d.maleDeathRate });
        }
    });

    // Create scales
    xScale = d3.scaleLinear()
        .domain(d3.extent(lungData, d => d.year))
        .range([0, width]);

    yScale = d3.scaleLinear()
        .domain([0, d3.max(lungData, d => d.maleDeathRate)])
        .range([height, 0]);

    chartG.append("text")
        .attr("id", "countries-title")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text("Lung Cancer Death Rates Over Time in United States").style("fill", "white");


    xAxis = chartG.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d"))).selectAll("text").style("fill", "#fff");

    yAxis = chartG.append("g")
        .call(d3.axisLeft(yScale)).selectAll("text").style("fill", "#fff");

    line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.rate));

    chartG.append("path")
        .attr("class", "line-path");

    updateLineChart("United States");
}

/***********************************************************************
 * 4) UPDATE LINE CHART ON COUNTRY SELECT
 ***********************************************************************/
function updateLineChart(country) {
    const data = dataByCountry[country];
    if (!data) return;

    xScale.domain(d3.extent(data, d => d.year));
    yScale.domain([0, d3.max(data, d => d.rate)]).nice();

    d3.select(".line-path")
        .datum(data)
        .transition()
        .duration(750)
        .attr("d", line);

    d3.select("#countries-title").text(`Lung Cancer Death Rate - ${country}`);
}

