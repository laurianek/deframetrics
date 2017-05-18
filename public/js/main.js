import * as d3 from 'd3'
// import the graphing elements
import PieChart from './pie-chart'

// Load some fake data
let landcover = [
    {
        'category': 'Woodland',
        'color': '#66c2a5',
        'percentage': 45
    },
    {
        'category': 'Farmland',
        'color': '#a6d854',
        'percentage': 25
    },
    {
        'category': 'Scrubland',
        'color': '#fc8d62',
        'percentage': 15
    },
    {
        'category': 'Water',
        'color': '#8da0cb',
        'percentage': 10
    },
    {
        'category': 'Houses',
        'color': '#e78ac3',
        'percentage': 5
    }
]

// Give fake data to graphs
let pieChart = new PieChart('pie-chart')
pieChart.setData(landcover)
pieChart.addSliceHoverListener(d => {
    d3.select('#info-pie')
        .text(`You are hovering over ${d.category}, which makes up ${d.percentage}% of the chart`)
})
pieChart.addSliceEndHoverListener(d => {
    d3.select('#info-pie')
        .text(`You are not hovering over the pie chart.  But you were hovering over ${d.category}`)
})

// Wire up callbacks to just write information to the info panel
