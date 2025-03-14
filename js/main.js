


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

    const option2018 = d3.select("#option-2018");
    const option2019 = d3.select("#option-2019");

    option2018.classed("active", true);
    option2019.classed("active", false);

    option2018.on("click", function() {
        // If we’re already on 2018, do nothing (optional).
        if (currentYear === 2018) return;

        currentYear = 2018;
        barVis.update(data2018, 2018);

        option2018.classed("active", true);
        option2019.classed("active", false);
    });


    option2019.on("click", function() {
        if (currentYear === 2019) return;

        currentYear = 2019;
        barVis.update(data2019, 2019);

        option2019.classed("active", true);
        option2018.classed("active", false);
    });

}).catch(function(error) {
    console.error("Error loading datasets:", error);
});

// // Yearly death count
// let pieChartInstance;
//
// d3.csv("data/NHS _Table_1.4_Cleaned.csv").then(data => {
//     data.forEach(d => {
//         d.Year = +d.Year;
//         d.ObservedDeaths = +d["Observed Deaths which can be caused by smoking"];
//         d.AttributableDeaths = +d["Attributable Deaths"];
//         d.NonAttributableDeaths = d.ObservedDeaths - d.AttributableDeaths;
//     });
//
//
//     const barVisInstance = new YearDeathBarVis({ parentElement: '#s3-year-death-barchart' }, data);
//
//
//     pieChartInstance = new YearDeathRatePieChart({ parentElement: '#s3-year-death-pie-chart', width: 300, height: 300 });
//
//
//     window.updatePieChart = function(d) {
//         const pieData = [
//             { name: "Non-Attributable Deaths", value: d.NonAttributableDeaths },
//             { name: "Attributable Deaths", value: d.AttributableDeaths }
//         ];
//         pieChartInstance.updateVis(pieData);
//     };
// });

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

//Globe - Lung - Only

let my4GlobeVis, my4LungLineChart;

Promise.all([
    d3.json("data/world-110m.json"),
    d3.csv("data/lung-cancer-deaths-per-100000-by-sex-1950-2002.csv", d => ({
        country: d.Entity,
        code: d.Code,
        year: +d.Year,
        maleDeathRate: +d["Age-standardized deaths from trachea, bronchus, lung cancers in males in those aged all ages per 100,000 people"]
    })),
    d3.csv("data/enforcement-of-bans-on-tobacco-advertising.csv", d => ({
        country: d.Entity,
        code: d.Code,
        year: +d.Year,
        banLevel: +d["Enforce bans on tobacco advertising"]
    }))
])
    .then(([worldData, lungData, banData]) => {

        const validCountries = new Set(lungData.map(d => d.country));

        my4LungLineChart = new LungLineChart("chart", lungData);

        my4GlobeVis = new GlobeVis("globe", worldData, validCountries, lungData, my4LungLineChart);





    })
    .catch(err => console.error(err));


// Globe - Ban

let myGlobeVis, myLungLineChart, myBanLineChart;

Promise.all([
    d3.json("data/world-110m.json"),
    d3.csv("data/lung-cancer-deaths-per-100000-by-sex-1950-2002.csv", d => ({
        country: d.Entity,
        code: d.Code,
        year: +d.Year,
        maleDeathRate: +d["Age-standardized deaths from trachea, bronchus, lung cancers in males in those aged all ages per 100,000 people"]
    })),
    d3.csv("data/enforcement-of-bans-on-tobacco-advertising.csv", d => ({
        country: d.Entity,
        code: d.Code,
        year: +d.Year,
        banLevel: +d["Enforce bans on tobacco advertising"]
    }))
])
    .then(([worldData, lungData, banData]) => {
        const validCountries = new Set(lungData.map(d => d.country));

        myLungLineChart = new LungLineChart("chart-lung", lungData);

        myBanLineChart = new BanLineChart("chart-ban", banData);

        myGlobeVis = new GlobeVis("globe-ban", worldData, validCountries, lungData, myLungLineChart, myBanLineChart);



    })
    .catch(err => console.error(err));

// UK SPENDING
document.addEventListener("DOMContentLoaded", function() {
    d3.csv("data/NHS _Table_3.2_Cleaned.csv").then(data => {
        data.forEach(d => {
            d.Year = +d.Year;
            d.HouseholdTobacco = +d["Household Expenditure on Tobacco"];
            d.TotalHousehold   = +d["Total Household Expenditure"];
            d.TobaccoPercent   = +d["Expenditure on Tobacco as a Percentage of Total"];
        });

        let mySpendingChart = new SmokingSpendingChart("section5-spending-chart", data);

    }).catch(err => {
        console.error("Error loading or parsing CSV: ", err);
    });
});


