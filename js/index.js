const width = 1000;
const barWidth = 500;
const height = 500;
const margin = 30;

const yearLable = d3.select('#year');
const countryName = d3.select('#country-name');

const barChart = d3.select('#bar-chart')
    .attr('width', barWidth)
    .attr('height', height);

const scatterPlot = d3.select('#scatter-plot')
    .attr('width', width)
    .attr('height', height);

const lineChart = d3.select('#line-chart')
    .attr('width', width)
    .attr('height', height);

let xParam = 'fertility-rate';
let yParam = 'child-mortality';
let rParam = 'gdp';
let year = '2000';
let param = 'child-mortality';
let lineParam = 'gdp';
let highlighted = '';
let selected;

const x = d3.scaleLinear().range([margin * 2, width - margin]);
const y = d3.scaleLinear().range([height - margin, margin]);

const xBar = d3.scaleBand().range([margin * 2, barWidth - margin]).padding(0.1);
const yBar = d3.scaleLinear().range([height - margin, margin])

const xAxis = scatterPlot.append('g').attr('transform', `translate(0, ${height - margin})`);
const yAxis = scatterPlot.append('g').attr('transform', `translate(${margin * 2}, 0)`);

const xLineAxis = lineChart.append('g').attr('transform', `translate(0, ${height - margin})`);
const yLineAxis = lineChart.append('g').attr('transform', `translate(${margin * 2}, 0)`);

const xBarAxis = barChart.append('g').attr('transform', `translate(0, ${height - margin})`);
const yBarAxis = barChart.append('g').attr('transform', `translate(${margin * 2}, 0)`);

const colorScale = d3.scaleOrdinal().range(['#DD4949', '#39CDA1', '#FD710C', '#A14BE5']);
const radiusScale = d3.scaleSqrt().range([10, 30]);

loadData().then(data => {
    console.log(data);
    colorScale.domain(d3.set(data.map(d => d.region)).values());

    d3.select('#range').on('change', function () {
        year = d3.select(this).property('value');
        yearLable.html(year);
        updateScattePlot();
        updateBar();
    });

    d3.select('#radius').on('change', function () {
        rParam = d3.select(this).property('value');
        updateScattePlot();
    });

    d3.select('#x').on('change', function () {
        xParam = d3.select(this).property('value');
        updateScattePlot();
    });

    d3.select('#y').on('change', function () {
        yParam = d3.select(this).property('value');
        updateScattePlot();
    });

    d3.select('#param').on('change', function () {
        param = d3.select(this).property('value');
        updateBar();
    });

    d3.select('#p').on('change', function () {
        lineParam = d3.select(this).property('value');
        updateLineChart();
    });

    function updateBar() {
        const barData = d3.nest()
            .key(d => d.region)
            .rollup(leaves => {
                return d3.mean(leaves.map(d => Number(d[param][year])))
            }).entries(data);

        console.log(barData);
        const selection = barChart
            .selectAll('rect')
            .data(barData);

        xBar.domain(barData.map(d => d.key));
        yBar.domain(d3.extent(barData.map(d => d.value)));
        const bars = selection.enter().append('rect');

        //Шкалы для осей
        var xScale = d3.scaleLinear()
            .domain(barData.map(d => d.key))
            .range([margin * 2, width - margin])
        var yScale = d3.scaleLinear()
            .domain(d3.extent(barData.map(d => d.value)))
            .range([height - margin, margin * 2])

        //Ось X
        var xBarAxis = d3.axisBottom().scale(xScale);
        barChart.selectAll('.x-bar-axis').remove()
        barChart.append('g')
            .attr('transform', `translate(0, ${height - margin})`)
            .attr('class', 'x-bar-axis')
            .call(xBarAxis);
        //Ось Y
        var yBarAxis = d3.axisLeft().scale(yScale);
        barChart.selectAll('.y-bar-axis').remove()
        barChart.append('g')
            .attr('transform', `translate(${margin * 2}, 0)`)
            .attr('class', 'y-bar-axis')
            .call(yBarAxis);

        selection.merge(bars)
            .attr('x', d => xBar(d.key))
            .attr('y', d => yBar(d.value) - margin)
            .attr('height', d => height - yBar(d.value))
            .attr('width', 95)
            .transition().duration(400)
            .attr('fill', d => colorScale(d.key))
            .attr('stroke', 'black')
            .attr('region', d => d.key)

        d3.selectAll('rect').on('click', function (d) {
            if (highlighted == '' || highlighted != this) {
                d3.selectAll('rect')
                    .style('opacity', 0.4);
                d3.select(this)
                    .style('opacity', 1);

                d3.selectAll('circle')
                    .style('opacity', 0);
                var regionOfBar = d3.select(this)
                    .attr('region');
                console.log(`bar region = ${regionOfBar}`);

                d3.selectAll('circle')
                    .filter(d => d.region == regionOfBar)
                    .style('opacity', 0.7);
                highlighted = this;
            } else {
                d3.selectAll('rect')
                    .style('opacity', 1);
                d3.selectAll('circle')
                    .style('opacity', 0.7);
                highlighted = '';
            }
        });
    }

    function updateScattePlot() {
        const xValues = data.map(d => Number(d[xParam][year])); //массив
        const xDomain = d3.extent(xValues); // [min, max]
        x.domain(xDomain); // [min, max] по xParam

        const yValues = data.map(d => Number(d[yParam][year])); //массив
        const yDomain = d3.extent(yValues); // [min, max]
        y.domain(yDomain); // [min, max] по yParam

        const selection = scatterPlot.selectAll('circle')
            .data(data)

        const circles = selection.enter()
            .append('circle')
            .attr('region', d => d.region); //создаём элементы

        //Шкалы для осей
        var xScale = d3.scaleLinear()
            .domain(d3.extent(xValues))
            .range([margin * 2, width - margin])
        var yScale = d3.scaleLinear()
            .domain(d3.extent(yValues))
            .range([height - margin, margin * 2])

        //Ось X
        var xAxis = d3.axisBottom().scale(xScale);
        scatterPlot.selectAll('.x-axis').remove()
        scatterPlot.append('g')
            .attr('transform', `translate(0, ${height - margin})`)
            .attr('class', 'x-axis')
            .call(xAxis);
        //Ось Y
        var yAxis = d3.axisLeft().scale(yScale);
        scatterPlot.selectAll('.y-axis').remove()
        scatterPlot.append('g')
            .attr('transform', `translate(${margin * 2}, 0)`)
            .attr('class', 'y-axis')
            .call(yAxis);

        radiusScale.domain(d3.extent(data.map(d => +d[rParam][year])));

        selection.merge(circles)
            .attr('r', d => radiusScale(d[rParam][year]))
            .attr('cx', d => x(Number(d[xParam][year])))
            .attr('cy', d => y(Number(d[yParam][year])))
            .attr('fill', d => colorScale(d.region))
            .attr('country', d => d.country);

        d3.selectAll('circle').on('click', function (d) {
            var pickedCountry = d3.select(this)
                .attr('country');
            d3.selectAll('circle')
                .attr('stroke-width', 'default');
            d3.selectAll('circle')
                .filter(d => d.country == pickedCountry)
                .attr('stroke-width', 4)
                .raise();
            selected = pickedCountry;
            updateLineChart();
        });

        return;
    }
    function updateLineChart() {
        if (selected != '') {
            d3.select('.country-name').text(selected);
            var displayedCountry = data.filter(d => d.country == selected)[0];
            try {
                //Убираем из массива лет лишние элементы-не годы
                var displayedYears = d3.keys(displayedCountry[lineParam]).splice(0, 221);
                var displayedCountry_years_values = [];
                displayedYears.forEach(function (item) {
                    displayedCountry_years_values.push({
                        "year": Number(item),
                        'value': Number(displayedCountry[lineParam][item])
                    });
                });
                console.log(displayedCountry_years_values)

                year_min = d3.min(displayedCountry_years_values, function (item) {
                    return item.year;
                });
                year_max = d3.max(displayedCountry_years_values, function (item) {
                    return item.year;
                });
                //Ось X
                var xScale = d3.scaleLinear()
                    .domain([year_min, year_max])
                    .range([margin * 2, width - margin]);
                var xLineAxis = d3.axisBottom()
                    .scale(xScale)
                    .tickFormat(d3.format("d"));
                lineChart.selectAll('.x-line-axis').remove();
                lineChart.append('g')
                    .attr('transform', `translate(0, ${height - margin})`)
                    .attr('class', 'x-line-axis')
                    .call(xLineAxis);

                value_min = d3.min(displayedCountry_years_values, function (item) {
                    return item.value;
                });
                value_max = d3.max(displayedCountry_years_values, function (item) {
                    return item.value;
                });
                //Ось Y
                var yScale = d3.scaleLinear()
                    .domain([value_min, value_max])
                    .range([height - margin, margin * 2]);
                var yLineAxis = d3.axisLeft()
                    .scale(yScale)
                lineChart.selectAll('.y-line-axis').remove();
                lineChart.append('g')
                    .attr('transform', `translate(${margin * 2}, 0)`)
                    .attr('class', 'y-line-axis')
                    .call(yLineAxis);

                lineChart.append('path')
                    .attr('class', 'line')
                    .data([displayedCountry_years_values])
                    .enter();

                lineChart.selectAll('.line')
                    .data([displayedCountry_years_values])
                    .attr("stroke", "#79ada0")
                    .attr("stroke-width", 2)
                    .attr("fill", "none")
                    .attr("d", d3.line()
                        .x(d => xScale(d.year))
                        .y(d => yScale(d.value)));

            }
            catch (err) { document.getElementById('country-name').innerHTML = 'click on the circle!' }
        }
        return;
    }
    updateLineChart();
    updateBar();
    updateScattePlot();
});


async function loadData() {
    const data = {
        'population': await d3.csv('data/population.csv'),
        'gdp': await d3.csv('data/gdp.csv'),
        'child-mortality': await d3.csv('data/cmu5.csv'),
        'life-expectancy': await d3.csv('data/life_expectancy.csv'),
        'fertility-rate': await d3.csv('data/fertility-rate.csv')
    };

    return data.population.map(d => {
        const index = data.gdp.findIndex(item => item.geo == d.geo);
        return {
            country: d.country,
            geo: d.geo,
            region: d.region,
            population: d,
            'gdp': data['gdp'][index],
            'child-mortality': data['child-mortality'][index],
            'life-expectancy': data['life-expectancy'][index],
            'fertility-rate': data['fertility-rate'][index]
        }
    })
}