
class BrushVis {
    constructor(_parentElement, _allData) {
        this.parentElement = _parentElement;
        this.allData = _allData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 10, right: 20, bottom: 30, left: 40 };
        vis.width  = 600 - vis.margin.left - vis.margin.right;
        vis.height = 60  - vis.margin.top  - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width",  vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);


        vis.minDate = d3.min(vis.allData, d => d.date);
        vis.maxDate = d3.max(vis.allData, d => d.date);


        vis.xBrush = d3.scaleTime()
            .domain([vis.minDate, vis.maxDate])
            .range([0, vis.width]);


        vis.xAxis = d3.axisBottom(vis.xBrush).ticks(5);
        vis.xAxisGroup = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.height})`)
            .call(vis.xAxis);


        vis.brush = d3.brushX()
            .extent([[0,0], [vis.width, vis.height]])
            .on("brush end", function(event) {
                vis.brushed(event);
            });


        vis.brushG = vis.svg.append("g")
            .attr("class", "brush")
            .call(vis.brush)
            .call(vis.brush.move, [0, vis.width]);
    }

    brushed(event) {
        let vis = this;
        const selection = event.selection;
        if (selection) {
            let [x0, x1] = selection;
            let date0 = vis.xBrush.invert(x0);
            let date1 = vis.xBrush.invert(x1);


            selectedTimeRange = [date0, date1];

            myTaxChart.wrangleData();
            myDeathChart.wrangleData();
        }
    }
}
