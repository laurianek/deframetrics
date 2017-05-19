import * as d3 from 'd3'
import '../css/pie-chart.css!'

export default class PieChart {
    constructor(divId) {
        // Could pass this in?
        this.margin = {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        }

        this.svg = d3.select(`#${divId}`)
            .append('svg')
            .attr('id', `${divId}-pie`)
            .attr('width', '100%')
            .attr('height', '100%')
        this.legend = d3.select(`#${divId}`)
            .append('div')
            .attr('id', `${divId}-legend`)
            .attr('class', 'pie-legend')
            .style('position', 'absolute')

        window.addEventListener('resize', () => {
            this._sizeArea()
            this._draw(true)
        })

        // Initialise
        this.graphArea = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

        // Group to draw areas in (aggregations)
        this.pieArea = this.graphArea
            .append('g')
        this.textArea = this.graphArea
            .append('g')

        this.sliceHoverListeners = []
        this.sliceEndHoverListeners = []

        this._selfHovers()
        this._sizeArea()
    }

    setData(data) {
        this.data = data

        this.legend
            .selectAll('*')
            .remove()
        let table = this.legend
            .append('table')
        this.data.map(d => {
            let row = table.append('tr')
            row.append('td')
                .attr('class', 'pie-legend-box')
                .style('background', d.color)
            row.append('td')
                .attr('class', 'pie-legend-box pie-text')
                .text(d.category)

        })

        this._draw()
    }

    addSliceHoverListener(l) {
        this.sliceHoverListeners.push(l)
    }

    addSliceEndHoverListener(l) {
        this.sliceEndHoverListeners.push(l)
    }

    _selfHovers() {
        this.labelText = this.textArea
            .append('text')
            .attr('class', 'pie-text')
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'central')
            .text('')
        this.percentageText = this.textArea
            .append('text')
            .attr('class', 'pie-text')
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'central')
            .text('')
        this.addSliceHoverListener(d => {
            this.labelText
                .text(`${d.category}`)
                .style('font-color', 'black')
                .transition()
                .duration(500)
                .style('opacity', 1)
            this.percentageText
                .text(`${d.percentage}%`)
                .style('font-color', 'black')
                .transition()
                .duration(500)
                .style('opacity', 1)
        })
        this.addSliceEndHoverListener(() => {
            this.labelText
                .style('font-color', 'black')
                .transition()
                .duration(500)
                .style('opacity', 0)
            this.percentageText
                .style('font-color', 'black')
                .transition()
                .duration(500)
                .style('opacity', 0)
        })
    }

    _sizeArea() {
        // Width and height ignore the margins. Since graph area has already been translated, we can just treat this.graphArea as a canvas of this width/height
        this.width = this.svg.node().getBoundingClientRect().width -
            this.margin.left -
            this.margin.right
        this.height = this.svg.node().getBoundingClientRect().height -
            this.margin.top -
            this.margin.bottom

        this.textArea
            .attr('transform', `translate(${this.width/2},${this.height/2})`)
        this.pieArea
            .attr('transform', `translate(${this.width/2},${this.height/2})`)
    }

    _draw(resize = false) {
        if (!this.data) {
            return
        }

        let pie = d3.pie()
            .sort(null)
            .value(d => d.percentage)

        // Calculate whether to use width or height as the basis for the radius
        let rad = this.width > this.height ? this.height / 2 : this.width / 2
        // Now scale it as much as desired
        rad *= 0.9
        let sf = 0.9
        rad *= sf

        this.innerRad = rad * 0.5

        let arcGen = d3.arc().innerRadius(this.innerRad).outerRadius(rad)
        let arcSel = this.pieArea.selectAll('path')
            .data(pie(this.data))

        arcSel
            .enter()
            .append('path')
            .attr('d', d => arcGen
                .outerRadius(d.data.active ? rad * 1.2 : rad)
                .startAngle(d.startAngle)
                .endAngle(d.endAngle)
                ()
            )
            .attr('class', 'pie-slice')
            .style('fill', d => d.data.color)
            .on('mouseover', d => {
                d.data.active = true
                this.sliceHoverListeners.map(l => l(d.data))
                this._draw()
            })
            .on('mouseout', d => {
                d.data.active = false
                this.sliceEndHoverListeners.map(l => l(d.data))
                this._draw()
            })

        arcSel
            .transition()
            // Don't transition if this is a window resize
            .duration(resize ? 0 : 500)
            .attr('d', d => arcGen
                .outerRadius(d.data.active ? rad / sf : rad)
                .startAngle(d.startAngle)
                .endAngle(d.endAngle)
                ()
            )

        arcSel
            .exit()
            .remove()

        this.labelText
            .attr('y', () => this.innerRad ? `-${this.innerRad*0.35}px` : '12px')
            .style('font-size', () => this.innerRad ? `${this.innerRad*0.25}px` : '12px')

        this.percentageText
            .attr('y', () => this.innerRad ? `${this.innerRad*0.15}px` : '12px')
            .style('font-size', () => this.innerRad ? `${this.innerRad*0.75}px` : '20px')
    }
}
