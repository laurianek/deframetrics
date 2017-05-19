import * as d3 from 'd3'
import '../css/strip-plot.css!'

export default class StripPlot {
    constructor(divId, showAxis = false) {
        // Large margin at the top for the tooltip
        // Large margin at the bottom for the axis / roiTooltip
        // Decent margins left + right for tooltip
        this.margin = {
            top: 80,
            right: 20,
            bottom: 50,
            left: 20
        }

        this.svg = d3.select(`#${divId}`)
            .append('svg')
            .attr('id', `${divId}-strip`)
            .attr('width', '100%')
            .attr('height', '100%')

        // The div into which we add the tooltip
        this.tooltip = d3.select(`#${divId}`)
            .append('div')
            .attr('class', 'strip-tooltip')
            .style('position', 'absolute')
            .style('opacity', 0)

        // The div into which we add the tooltip for the region of interest
        // Set the opacity to 0, then make it 1 once we actually have a valid ROI
        this.roiTooltip = d3.select(`#${divId}`)
            .append('div')
            .attr('id', `${divId}-roi-tooltip`)
            .attr('class', 'strip-tooltip')
            .style('position', 'absolute')
            .style('opacity', 0)

        window.addEventListener('resize', () => {
            this._sizeArea()
            this._drawAxis()
            this._draw()
        })

        // Initialise
        this.graphArea = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

        // Group to draw areas in (aggregations)
        this.stripArea = this.graphArea
            .append('g')

        this.showAxis = showAxis
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
        let roiFound = false
        this.data.map((d, i) => {
            if (this.roi == d.parish) {
                roiIndex = i
                roiFound = true
            }
        })
        if (roiFound) {
            this.roiData = this.data[roiIndex]
            this.data.splice(roiIndex, 1)
            this.data.push(this.roiData)

            this.roiTooltip
                .html(`<h1>${this.roiData.parish}</h1>${this.roiData.value}<span></span>`)
                .style('bottom', `${10}px`)
                // The extra 10 pixels here are to account for the margin
                // and padding.  This is not great, since CSS can change them!
                .style('left', `${this.x(this.roiData.value) + this.margin.left + 10 - this.roiTooltip.node().clientWidth/2}px`)
                .style('opacity', 1)
        }


        let dataExtent = d3.extent(this.data, d => d.value)
        // let margin = (dataExtent[1] - dataExtent[0]) * 0.05
        // this.x.domain([dataExtent[0] - margin, dataExtent[1] + margin])
        this.x.domain([dataExtent[0], dataExtent[1]])

        this._drawAxis()
        this._draw()
    }

    addParishHoverListener(l) {
        this.lineHoverListeners.push(l)
    }

    addParishEndHoverListener(l) {
        this.lineEndHoverListeners.push(l)
    }

    _selfHovers() {
        this.addParishHoverListener(d => {
            if (d.parish !== this.roi) {
                this.tipData = d
                this.tooltip
                    .html(`<h1>${d.parish}</h1>${d.value}<span></span>`)
                    .style('bottom', `${this.height+this.margin.bottom+10}px`)
                    .style('left', `${this.x(d.value) + this.margin.left - this.tooltip.node().clientWidth/2}px`)
                    .transition()
                    .duration(200)
                    .style('opacity', 1)
            }
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

        // This is just the axis area, so it doesn't need the margin offsets
        this.axisArea
            .attr('transform', `translate(0,${this.height})`)

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
            .attr('x', d => this.x(d.value) - 2)
            .attr('y', 0)
            .attr('width', 5)
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

        stripSel
            .attr('x', d => this.x(d.value) - 2)
            .attr('height', this.height)
            .attr('class', d => {
                let clazz = 'strip-line'
                if (d.parish === this.roi) {
                    clazz += ' strip-highlight'
                } else if (d.active) {
                    clazz += ' strip-hover'
                }
                return clazz
            })

        // Move the tooltips to the right place
        // Probably not strictly necessary for the main one, since it fades out
        if (this.tipData) {
            this.tooltip
                .style('bottom', `${this.height+this.margin.bottom+10}px`)
                .style('left', `${this.x(this.tipData.value) + this.margin.left - this.tooltip.node().clientWidth/2}px`)
        }

        if (this.roiData) {
            this.roiTooltip
                .html(`<h1>${this.roiData.parish}</h1>${this.roiData.value}<span></span>`)
                .style('bottom', `${10}px`)
                .style('left', `${this.x(this.roiData.value) + this.margin.left - this.roiTooltip.node().clientWidth/2}px`)
        }
    }

    _drawAxis() {
        if (!this.showAxis || !this.data) {
            return
        }
        this.axis = d3.axisBottom(this.x)
        this.axisArea.selectAll('*').remove()
        this.axisArea.call(this.axis)
        this.axisArea.selectAll('text')
            .attr('class', 'strip-axis-text')
        this.axisArea.selectAll('line')
            .attr('class', 'strip-axis')
        this.axisArea.selectAll('.domain')
            .attr('class', 'strip-axis')
    }
}
