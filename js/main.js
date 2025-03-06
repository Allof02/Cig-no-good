


// SECTION 3

// Disease bar charts
let data2018, data2019;
let currentYear = 2018;

Promise.all([
    d3.csv("data/NHS Table 1.2 Cleaned.csv"),  // 2018 data
    d3.csv("data/NHS_Table_1.3_Cleaned.csv")   // 2019 data
]).then(function([data1, data2]) {

    data1.forEach(d => {
        d["Total Admissions"] = +d["Total Admissions"];
        d["Attributable Admissions"] = +d["Attributable Admissions"];
        d["Attributable Percentage"] = +d["Attributable Percentage"];
    });
    data2018 = data1;

    data2.forEach(d => {
        d["Total Admissions"] = +d["Total Admissions"];
        d["Attributable Admissions"] = +d["Attributable Admissions"];
        d["Attributable Percentage"] = +d["Attributable Percentage"];
    });
    data2019 = data2;

    barVis.init(data2018);

    barVis.update(data2018, 2018);

    d3.select("#section3")
        .append("button")
        .attr("class", "custom-btn")
        .attr("id", "toggleButton")
        .text("Switch to 2019")
        .on("click", function() {
            if (currentYear === 2018) {
                currentYear = 2019;
                barVis.update(data2019, 2019);
                d3.select(this).text("Switch to 2018");
            } else {
                currentYear = 2018;
                barVis.update(data2018, 2018);
                d3.select(this).text("Switch to 2019");
            }
        });

}).catch(function(error) {
    console.error("Error loading datasets:", error);
});