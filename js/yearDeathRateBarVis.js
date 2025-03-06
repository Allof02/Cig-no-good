class YearDeathBarVis {
    constructor(config, data) {
        this.config = {
            parentElement: config.parentElement,
            width: 800,
            height: 500,
            margin: { top: 20, right: 100, bottom: 100, left: 100 }
        };
        this.data = data;
        this.initVis();
    }

    initVis() {
        const { width, height, margin } = this.config;

        this.svg = d3.select(this.config.parentElement)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        this.xScale = d3.scaleLinear()
            .range([0, width - margin.left - margin.right]);

        this.yScale = d3.scaleBand()
            .range([0, height - margin.top - margin.bottom])
            .padding(0.1);

        this.color = d3.scaleOrdinal()
            .domain(['Non-Attributable Deaths', 'Attributable Deaths'])
            .range(['#a6cee3', '#fb9a99']);

        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip");

        this.updateVis();
    }

    updateVis() {
        this.data.sort((a, b) => a.Year - b.Year);

        this.xScale.domain([0, d3.max(this.data, d => d.ObservedDeaths)]);
        this.yScale.domain(this.data.map(d => d.Year));

        this.renderVis();
    }

    renderVis() {
        const barGroups = this.chart.selectAll('.bar-group')
            .data(this.data)
            .join('g')
            .attr('class', 'bar-group')
            .attr('transform', d => `translate(0,${this.yScale(d.Year)})`);

        // Non-Attributable segment
        barGroups.append('rect')
            .attr('class', 'non-attributable-bar')
            .attr('x', 0)
            .attr('height', this.yScale.bandwidth())
            .attr('width', d => this.xScale(d.NonAttributableDeaths))
            .attr('fill', this.color('Non-Attributable Deaths'))
            .on('mouseover', (event, d) => {
                this.showTooltip(event, d, 'Non-Attributable Deaths', d.NonAttributableDeaths);
                if (window.updatePieChart) window.updatePieChart(d);
            })
            .on('mouseout', () => this.hideTooltip());

        // Attributable segment
        barGroups.append('rect')
            .attr('class', 'attributable-bar')
            .attr('x', d => this.xScale(d.NonAttributableDeaths))
            .attr('height', this.yScale.bandwidth())
            .attr('width', d => this.xScale(d.AttributableDeaths))
            .attr('fill', this.color('Attributable Deaths'))
            .on('mouseover', (event, d) => {
                this.showTooltip(event, d, 'Attributable Deaths', d.AttributableDeaths);
                if (window.updatePieChart) window.updatePieChart(d);
            })
            .on('mouseout', () => this.hideTooltip());

        this.chart.append('g')
            .call(d3.axisLeft(this.yScale)).selectAll("text")
            .style("fill", "#cfcfcf");

        this.chart.append('g')
            .attr('transform', `translate(0, ${this.config.height - this.config.margin.top - this.config.margin.bottom})`)
            .call(d3.axisBottom(this.xScale)).selectAll("text")
            .style("fill", "#cfcfcf");

        // Legend code
        const legend = this.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${this.config.width / 2 - 100}, ${this.config.height - 30})`);

        const legendData = [
            { name: "Non-Attributable Deaths", color: this.color("Non-Attributable Deaths") },
            { name: "Attributable Deaths", color: this.color("Attributable Deaths") }
        ];

        legend.selectAll(".legend-item")
            .data(legendData)
            .join("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(${i * 180}, 0)`)
            .each(function(d) {
                d3.select(this).append("rect")
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr("fill", d.color);

                d3.select(this).append("text")
                    .attr("x", 20)
                    .attr("y", 12)
                    .text(d.name)
                    .attr("font-size", "12px")
                    .style("fill", "#cfcfcf");
            });
    }

    showTooltip(event, d, type, value) {
        this.tooltip
            .style('opacity', 1)
            .html(`<strong>Year:</strong> ${d.Year}<br><strong>${type}:</strong> ${value.toLocaleString()}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px');
    }

    hideTooltip() {
        this.tooltip.style('opacity', 0);
    }
}
