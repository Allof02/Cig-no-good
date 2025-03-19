var barVis = (function() {

    let svg, xScale, xSubgroup, yScale, color, tooltip;
    let width, height, margin;
    let chartG;

    const diseaseExplanations = {
        "Trachea, Lung, Bronchus": `
        These are key structures in the respiratory system. 
        The trachea (windpipe) connects the throat to the lungs, and the bronchi are the main airways in the lungs. 
        Smoking is the primary risk factor for cancers in this region, as it damages cells and affects breathing.
    `,
        "Upper Respiratory Sites": `
        "Upper respiratory sites" generally refers to areas like the nose, nasal cavity, sinuses, and parts of the throat. 
        Smoking and prolonged exposure to certain chemicals can increase the risk of cancer in these tissues, 
        which are involved in filtering and humidifying the air we breathe.
    `,
        "Oesophagus": `
        The oesophagus (or esophagus) is the tube that carries food and liquids from the throat to the stomach. 
        Smoking and heavy alcohol use are major risk factors for oesophageal cancer, 
        as they irritate the lining and can lead to abnormal cell growth.
    `,
        "Larynx": `
        The larynx (voice box) sits atop the windpipe and houses the vocal cords. 
        Smoking is the most significant risk factor for laryngeal cancer, 
        causing changes in the cells that can lead to tumor formation and affect speaking ability.
    `,
        "Cervical": `
        Cervical cancer affects the cervix, which is the lower part of the uterus connecting to the vagina. 
        While human papillomavirus (HPV) infection is the most common cause, 
        smoking can also increase the risk by weakening cervical cells’ ability to fight off HPV.
    `,
        "Bladder": `
        The bladder stores urine before it is excreted. 
        Chemicals in tobacco smoke are absorbed into the bloodstream, filtered by the kidneys, and ultimately excreted into the bladder. 
        This prolonged exposure to carcinogens increases the risk of bladder cancer in smokers.
    `,
        "Kidney and Renal Pelvis": `
        The kidneys filter waste from the blood, and the renal pelvis is where urine collects before moving to the ureter. 
        Smoking can contribute to kidney cancer by increasing blood pressure and introducing carcinogenic substances into the urinary tract.
    `,
        "Stomach": `
        The stomach is responsible for breaking down food using acids and enzymes. 
        Chronic irritation from smoking can damage the stomach lining, increasing the likelihood of abnormal cell growth and stomach cancer over time.
    `,
        "Pancreas": `
        The pancreas is located behind the stomach and produces enzymes for digestion as well as hormones like insulin. 
        Smoking is a significant risk factor for pancreatic cancer, contributing to inflammation and DNA damage in pancreatic cells.
    `,
        "Unspecified Site": `
        This category indicates a cancer that is not clearly classified in medical records or does not fit other specified categories. 
        While details are unknown, smoking remains a potential risk factor for many types of cancer across various tissues.
    `,
        "Myeloid Leukaemia": `
        Myeloid leukaemia is a group of cancers that begin in the bone marrow where blood cells are produced. 
        Smoking may increase the risk of leukemia by introducing carcinogens that affect blood cell DNA 
        and weaken the body’s defense mechanisms.
    `
    };


    // Icon map for each cancer
    // not used anymore
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

    function init(data) {
        margin = { top: 40, right: 20, bottom: 120, left: 60 };
        width = 1200 - margin.left - margin.right;
        height = 800 - margin.top - margin.bottom;

        svg = d3.select("#section3-cancers-charts")
            .append("svg")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .style("width", "100%")
            .style("height", "100%");


        chartG = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);


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

        xScale = d3.scaleBand()
            .padding(0.2)
            .range([0, width]);

        xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .padding(0.05);

        yScale = d3.scaleLinear()
            .range([height, 0]);

        color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(["#8884d8", "#82ca9d"]);

        update(data);
    }

    // update
    function update(data, year) {

        let title = chartG.select(".chart-title");
        if (year) {
            title.text(`All Cancer admissions vs. Smoking-attributable admissions in UK in ${year}`);
        }

        let maxVal = d3.max(data, d =>
            Math.max(d["Total Admissions"], d["Attributable Admissions"])
        );

        xScale.domain(data.map(d => d["Specific Disease"]));
        xSubgroup.range([0, xScale.bandwidth()]);
        yScale.domain([0, maxVal]).nice();

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

        chartG.selectAll(".y-axis").remove();
        chartG.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .style("fill", "#cfcfcf");

        let diseaseGroups = chartG.selectAll(".disease-group")
            .data(data, d => d["Specific Disease"]); // key by disease

        let diseaseGroupsEnter = diseaseGroups.enter()
            .append("g")
            .attr("class", "disease-group")
            .attr("transform", d => `translate(${xScale(d["Specific Disease"])}, 0)`);

        diseaseGroups.exit().remove();

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
            .on("click", function(event, d) {
                let diseaseName = d.disease;
                let explanation = diseaseExplanations[diseaseName] ||
                    "No detailed explanation available for this disease.";

                d3.select("#section3-cancers-exp p").html(explanation).style("color", "white").style("font-size", "30px");
            })
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", 0.9);

                if(d.key === "Attributable Admissions"){
                    tooltip.html(`
                        <div style="display: flex; align-items: center;">
                         
                          <div>
                            <strong>${d.disease}</strong><br/>
                            ${d.key}: ${d.value.toLocaleString()}<br/>
                            Attributable %: ${d.percentage}%
                          </div>
                        </div>
                    `);
                } else {
                    tooltip.html(`
                        <div style="display: flex; align-items: center;">
                      
                          <div>
                            <strong>${d.disease}</strong><br/>
                            ${d.key}: ${d.value.toLocaleString()}
                          </div>
                        </div>
                    `);
                }

                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");

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

        color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(["#8884d8", "#82ca9d"]);


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
