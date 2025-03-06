class YearDeathRatePieChart {
    constructor(config) {
        this.config = {
            parentElement: config.parentElement,
            width: config.width || 300,
            height: config.height || 300,
            margin: config.margin || { top: 20, right: 20, bottom: 20, left: 20 }
        };
        this.initVis();
    }

    initVis() {
        const { width, height, margin } = this.config;
        // Calculate radius as the smallest dimension minus margins divided by 2
        this.radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2;

        // Create the SVG container and group element
        this.svg = d3.select(this.config.parentElement)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        // Create a pie layout generator and arc generator
        this.pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        this.arc = d3.arc()
            .innerRadius(0)
            .outerRadius(this.radius);

        // Color scale for slices
        this.color = d3.scaleOrdinal()
            .domain(["Non-Attributable Deaths", "Attributable Deaths"])
            .range(["#a6cee3", "#fb9a99"]);

        // Draw initial (empty) chart
        this.updateVis([]);
    }

    updateVis(data) {
        const pieData = this.pie(data);

        // Bind data to path elements (slices)
        const slices = this.svg.selectAll("path")
            .data(pieData);

        slices.join("path")
            .transition().duration(300)
            .attr("d", this.arc)
            .attr("fill", d => this.color(d.data.name));

        // Bind data to text elements for percentage labels
        const texts = this.svg.selectAll("text")
            .data(pieData);

        texts.join("text")
            .transition().duration(300)
            .attr("transform", d => `translate(${this.arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .text(d => {
                if (d.data.value === 0) return "";
                const total = d3.sum(data, d => d.value);
                const percent = Math.round((d.data.value / total) * 100);
                return percent + '%';
            });
    }
}
