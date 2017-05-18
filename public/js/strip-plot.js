import * as d3 from 'd3'
import '../css/strip-plot.css!'

export default class StripPlot {
    constructor(divId) {
        // Large margin at the top for the tooltip
        // Large margin at the bottom for the axis
        this.margin = {
            top: 80,
            right: 10,
            bottom: 50,
            left: 10
        }

        this.svg = d3.select(`#${divId}`)
            .append('svg')
            .attr('id', `${divId}-strip`)
            .attr('width', '100%')
            .attr('height', '100%')

        this.tooltip = d3.select(`#${divId}`)
            .append('div')
            .attr('class', 'strip-tooltip')
            .style('position', 'absolute')
            .style('opacity', 0)

        window.addEventListener('resize', () => {
            this._sizeArea()
            this._draw(true)
        })


        let defs = this.svg.append('defs')
        this.clipPath = defs.append('svg:clipPath')
            .attr('id', `${divId}-strip-clip`)
            .append('svg:rect')

        // Initialise
        this.graphArea = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

        // Group to draw areas in (aggregations)
        this.stripArea = this.graphArea
            .append('g')
            // .attr('clip-path', `url(#${divId}-strip-clip)`)
        this.axisArea = this.graphArea
            .append('g')

        this.lineHoverListeners = []
        this.lineEndHoverListeners = []

        this.x = d3.scaleLinear()
        // Region of interest - the strip to highlight
        this.roi = undefined

        this._selfHovers()
        this._sizeArea()
    }

    setData(data, roi) {
        this.roi = roi
        this.data = data

        // Move the ROI to the end of the list so it doesn't get drawn over
        let roiIndex = this.data.length
        this.data.map((d, i) => {
            if (this.roi == d.parish) {
                roiIndex = i
            }
        })
        let roiData = this.data[roiIndex]
        this.data.splice(roiIndex, 1)
        this.data.push(roiData)

        let dataExtent = d3.extent(this.data, d => d.value)
        let margin = (dataExtent[1] - dataExtent[0]) * 0.05
        this.x.domain([dataExtent[0] - margin, dataExtent[1] + margin])

        this._draw()
    }

    addParishHoverListener(l) {
        this.lineHoverListeners.push(l)
    }

    addParishEndHoverListener(l) {
        this.lineEndHoverListeners.push(l)
    }

    _selfHovers() {
        this.addParishHoverListener((d,x) => {
            this.tooltip
                .html(`<h1>${d.parish}</h1>${d.value}`)
                .style('bottom', `${this.height+this.margin.bottom}px`)
                .style('left', `${d3.event.offsetX - this.tooltip.node().clientWidth/2}px`)
                .transition()
                .duration(200)
                .style('opacity', 1)
        })
        this.addParishEndHoverListener(() => {
            this.tooltip
                .transition()
                .delay(500)
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

        this.clipPath.attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width)
            .attr('height', this.height)

        this.stripArea
            .attr('transform', `translate(${this.margin.left},0)`)//${this.margin.top})`)
        this.axisArea
            .attr('transform', `translate(${this.margin.left},${this.margin.top+this.height})`)

        this.x.range([0, this.width])
    }

    _draw(resize = false) {
        if (!this.data) {
            return
        }

        let stripSel = this.stripArea
            .selectAll('rect')
            .data(this.data)

        stripSel
            .enter()
            .append('rect')
            .attr('class', d => d.parish === this.roi ? 'strip-line strip-highlight' : 'strip-line')
            .attr('x', d => this.x(d.value) - 1)
            .attr('y', 0)
            .attr('width', 3)
            .attr('height', this.height)
            .on('mouseover', d => {
                d.active = true
                this.lineHoverListeners.map(l => l(d))
                this._draw()
            })
            .on('mouseout', d => {
                d.active = false
                this.lineEndHoverListeners.map(l => l(d))
                this._draw()
            })


        // this.labelText
        //     .attr('y', () => this.innerRad ? `-${this.innerRad*0.35}px` : '12px')
        //     .style('font-size', () => this.innerRad ? `${this.innerRad*0.25}px` : '12px')
        //
        // this.percentageText
        //     .attr('y', () => this.innerRad ? `${this.innerRad*0.15}px` : '12px')
        //     .style('font-size', () => this.innerRad ? `${this.innerRad*0.75}px` : '20px')
    }
}
