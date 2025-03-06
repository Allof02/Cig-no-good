// barVis.js
var barVis = (function() {


    let svg, xScale, xSubgroup, yScale, color, tooltip;
    let width, height, margin;
    let chartG; // main <g> for the bars

    // Map each disease to an icon path (adjust to your actual files)
    const organIconMap = {
        "Trachea, Lung, Bronchus": "icons/lung.png",
        "Upper Respiratory Sites": "icons/throat.png",
        "Oesophagus": "icons/esophagus.png",
        "Larynx": "icons/larynx.png",
        "Cervical": "icons/cervix.png",
        "Bladder": "icons/bladder.png",
        "Kidney and Renal Pelvis": "icons/kidney.png",
        "Stomach": "icons/stomach.png",
        "Pancreas": "icons/pancreas.png",
        "Unspecified Site": "icons/unspecified.png",
        "Myeloid Leukaemia": "icons/leukemia.png"
    };

    // total vs. attributable
    const subgroups = ["Total Admissions", "Attributable Admissions"];

    // init
    function init(data) {
        // Set margins and dimensions
        margin = { top: 40, right: 20, bottom: 120, left: 60 };
        width = 1200 - margin.left - margin.right;
        height = 800 - margin.top - margin.bottom;

        // Append SVG to #section3
        svg = d3.select("#section3")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        // Main group
        chartG = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // tooltip
        tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("padding", "8px")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "#fff")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        chartG.append("text")
            .attr("class", "chart-title")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2 + 150)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("fill", "#fff")
            .text("All Cancer admissions vs. Smoking-attributable admissions in UK in 2018");

        // xScale: disease names
        xScale = d3.scaleBand()
            .padding(0.2)
            .range([0, width]);

        // xSubgroup: side-by-side bars
        xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .padding(0.05);

        // yScale: admissions count
        yScale = d3.scaleLinear()
            .range([height, 0]);

        // color scale for the subgroups
        color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(["#8884d8", "#82ca9d"]);

        update(data);
    }

    // update
    function update(data, year) {

        //set a title
        let title = chartG.select(".chart-title");

        title.text(`All Cancer admissions vs. Smoking-attributable admissions in UK in ${year}`);

        // determine the max value among total or attributable admissions
        let maxVal = d3.max(data, d =>
            Math.max(d["Total Admissions"], d["Attributable Admissions"])
        );

        // update domains
        xScale.domain(data.map(d => d["Specific Disease"]));
        xSubgroup.range([0, xScale.bandwidth()]);
        yScale.domain([0, maxVal]).nice();

        // draw axis
        // X axis
        chartG.selectAll(".x-axis").remove();
        chartG.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .style("fill", "#cfcfcf")
            .style("font-size", "12px")
            .attr("dx", "-0.5em")
            .attr("dy", "-0.5em")
            .attr("transform", "rotate(-45)");

        // Y axis
        chartG.selectAll(".y-axis").remove();
        chartG.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .style("fill", "#cfcfcf");

        // join bars
        let diseaseGroups = chartG.selectAll(".disease-group")
            .data(data, d => d["Specific Disease"]); // key by disease name

        // enter
        let diseaseGroupsEnter = diseaseGroups.enter()
            .append("g")
            .attr("class", "disease-group")
            .attr("transform", d => `translate(${xScale(d["Specific Disease"])}, 0)`);

        // exit
        diseaseGroups.exit().remove();

        // merge
        diseaseGroups = diseaseGroupsEnter.merge(diseaseGroups)
            .attr("transform", d => `translate(${xScale(d["Specific Disease"])}, 0)`);

        let bars = diseaseGroups.selectAll("rect")
            .data(d => subgroups.map(key => ({
                key: key,
                value: d[key],
                disease: d["Specific Disease"],
                percentage: d["Attributable Percentage"],
                icd10: d["ICD-10 Code"] || "N/A",
                icon: organIconMap[d["Specific Disease"]] || "icons/default.png"
            })));

        bars.exit().remove();

        let barsEnter = bars.enter()
            .append("rect")
            .attr("x", d => xSubgroup(d.key))
            .attr("y", d => yScale(d.value))
            .attr("width", xSubgroup.bandwidth())
            .attr("height", d => height - yScale(d.value))
            .attr("fill", d => color(d.key))
            .on("mouseover", function(event, d) {
                console.log(d.key);
                tooltip.transition().duration(200).style("opacity", 0.9);
                if(d.key === "Attributable Admissions"){
                    tooltip.html(`
          <div style="display: flex; align-items: center;">
            <img src="${d.icon}" alt="icon" width="40" height="40" style="margin-right: 10px;" />
            <div>
              <strong>${d.disease}</strong><br/>
              ${d.key}: ${d.value.toLocaleString()}<br/>
              Attributable %: ${d.percentage}%<br/>
            </div>
          </div>
        `)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");


                } else{



                    tooltip.html(`
          <div style="display: flex; align-items: center;">
            <img src="${d.icon}" alt="icon" width="40" height="40" style="margin-right: 10px;" />
            <div>
              <strong>${d.disease}</strong><br/>
              ${d.key}: ${d.value.toLocaleString()}<br/>
            </div>
          </div>
        `)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }

            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition().duration(300).style("opacity", 0);
            });

        barsEnter.merge(bars)
            .transition()
            .duration(600)
            .attr("x", d => xSubgroup(d.key))
            .attr("y", d => yScale(d.value))
            .attr("width", xSubgroup.bandwidth())
            .attr("height", d => height - yScale(d.value))
            .attr("fill", d => color(d.key));

        chartG.selectAll(".legend-group").remove();
        let legendData = subgroups;
        let legend = chartG.append("g")
            .attr("class", "legend-group")
            .attr("transform", `translate(0, -10)`);

        legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("rect")
            .attr("class", "legend-item")
            .attr("x", (d,i) => i * 150)
            .attr("y", -margin.top/2)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", d => color(d));

        legend.selectAll(".legend-text")
            .data(legendData)
            .enter()
            .append("text")
            .attr("x", (d,i) => i * 150 + 25)
            .attr("y", -margin.top/2 + 15)
            .style("fill", "#fff")
            .text(d => d);
    }

    return {
        init: init,
        update: update
    };
})();
