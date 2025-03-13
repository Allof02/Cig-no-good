


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
        .style("display", "block")
        .style("margin", "40px auto")
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

// Yearly death count
let pieChartInstance;

d3.csv("data/NHS _Table_1.4_Cleaned.csv").then(data => {
    data.forEach(d => {
        d.Year = +d.Year;
        d.ObservedDeaths = +d["Observed Deaths which can be caused by smoking"];
        d.AttributableDeaths = +d["Attributable Deaths"];
        d.NonAttributableDeaths = d.ObservedDeaths - d.AttributableDeaths;
    });


    const barVisInstance = new YearDeathBarVis({ parentElement: '#s3-year-death-barchart' }, data);


    pieChartInstance = new YearDeathRatePieChart({ parentElement: '#s3-year-death-pie-chart', width: 300, height: 300 });


    window.updatePieChart = function(d) {
        const pieData = [
            { name: "Non-Attributable Deaths", value: d.NonAttributableDeaths },
            { name: "Attributable Deaths", value: d.AttributableDeaths }
        ];
        pieChartInstance.updateVis(pieData);
    };
});

//UK DEATH TAX CHARTS
let myTaxChart, myDeathChart, myBrushVis;
let selectedTimeRange = [];


Promise.all([
    d3.csv("data/Excise_Duty_Calculation__2009-2024_.csv"),
    d3.csv("data/UK_YEAR_DEATH.csv")
])
    .then(([taxData, deathData]) => {


        const parseYear = d3.timeParse("%Y");

        taxData.forEach(d => {
            d.Year        = +d.Year;
            d.SpecificTax = +d["Specific Tax (£ per 1,000 sticks)"];
            d.date        = parseYear(d.Year);
        });

        deathData.forEach(d => {
            d.Year                 = +d.Year;
            d.AttributablePercentage = +d["Attributable percentage"];
            d.date                 = parseYear(d.Year);
        });


        myTaxChart   = new TaxChart("tax-chart", taxData);
        myDeathChart = new DeathChart("death-chart", deathData);
        const allData = taxData.concat(deathData);
        myBrushVis   = new BrushVis("brush-chart", allData);

    })
    .catch(err => {
        console.error("Error loading data:", err);
    });






