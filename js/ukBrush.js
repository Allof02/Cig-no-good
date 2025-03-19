
class BrushVis {
    constructor(_parentElement, _allData) {
        this.parentElement = _parentElement;
        this.allData = _allData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 20, bottom: 40, left: 40 };
        vis.width = 600 - vis.margin.left - vis.margin.right;
        vis.height = 80 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.minDate = d3.min(vis.allData, d => d.date);
        vis.maxDate = d3.max(vis.allData, d => d.date);

        vis.xBrush = d3.scaleTime()
            .domain([vis.minDate, vis.maxDate])
            .range([0, vis.width]);

        vis.svg.append("rect")
            .attr("class", "brush-background")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("fill", "#444")
            .attr("rx", 4)
            .attr("ry", 4);

        vis.svg.append("text")
            .attr("class", "brush-label")
            .attr("x", vis.width / 2)
            .attr("y", -8)
            .attr("text-anchor", "middle")
            .style("fill", "#fff")
            .style("font-weight", "bold")
            .style("font-size", "12px")
            .text("DRAG HANDLES TO FILTER TIME RANGE");

        vis.xAxis = d3.axisBottom(vis.xBrush).ticks(5);
        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "brush-axis")
            .attr("transform", `translate(0, ${vis.height})`)
            .call(vis.xAxis);

        vis.xAxisGroup.selectAll("text")
            .style("fill", "#fff")
            .style("font-size", "10px");
        vis.xAxisGroup.selectAll("line")
            .style("stroke", "#888");
        vis.xAxisGroup.selectAll("path")
            .style("stroke", "#888");

        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("brush end", function(event) {
                vis.brushed(event);
            });

        vis.brushG = vis.svg.append("g")
            .attr("class", "brush")
            .call(vis.brush)
            .call(vis.brush.move, [0, vis.width]);

        vis.styleBrush();

        vis.addBrushHint();
    }

    styleBrush() {
        let vis = this;

        vis.svg.selectAll(".selection")
            .attr("fill", "#6baed6")
            .attr("fill-opacity", 0.3)
            .attr("stroke", "#6baed6")
            .attr("stroke-width", 2);

        vis.svg.selectAll(".handle")
            .attr("fill", "#6baed6")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("width", 8)
            .attr("rx", 3)
            .attr("ry", 3);

        vis.svg.selectAll(".handle").each(function(d, i) {
            const handle = d3.select(this);
            const handleGroup = vis.svg.append("g")
                .attr("class", "handle-grip")
                .attr("transform", `translate(${i === 0 ? -3 : vis.width+3}, ${vis.height/2-10})`);

            // add grip lines
            for (let j = 0; j < 3; j++) {
                handleGroup.append("line")
                    .attr("x1", 0)
                    .attr("y1", j * 7)
                    .attr("x2", 6)
                    .attr("y2", j * 7)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1.5);
            }
        });
    }

    addBrushHint() {
        let vis = this;

        // add a pulsing hint arrow pointing to right handle
        vis.hintGroup = vis.svg.append("g")
            .attr("class", "brush-hint")
            .attr("transform", `translate(${vis.width-15}, ${vis.height/2-15})`)
            .style("opacity", 1);

        // arrow pointing to handle
        vis.hintGroup.append("path")
            .attr("d", "M0,0 L10,10 L0,20 Z")
            .attr("fill", "#ffcc00");

        // add pulsing animation
        function pulseHint() {
            vis.hintGroup.transition()
                .duration(800)
                .style("opacity", 0.3)
                .transition()
                .duration(800)
                .style("opacity", 1)
                .on("end", pulseHint);
        }

        // Start animation
        pulseHint();

        // remove hint after first interaction
        vis.brushG.on("mousedown.hint", function() {
            vis.hintGroup.remove();
            vis.brushG.on("mousedown.hint", null);
        });
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

            const handleGroups = vis.svg.selectAll(".handle-grip");
            if (!handleGroups.empty()) {
                handleGroups.each(function(d, i) {
                    d3.select(this).attr("transform",
                        `translate(${i === 0 ? x0-9 : x1+3}, ${vis.height/2-10})`);
                });
            }
        }
    }
}

// Add this CSS to your styles.css file:
/*
.brush .selection {
    cursor: move;
}
.brush .handle {
    cursor: ew-resize;
}
.brush-background {
    opacity: 0.7;
}
.brush-label {
    font-family: sans-serif;
    pointer-events: none;
}
.handle-grip {
    pointer-events: none;
}
.brush-hint {
    pointer-events: none;
}
*/