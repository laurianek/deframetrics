import * as d3 from 'd3'
import '../css/pie-chart.css!'

export default class PieChart {
    constructor(divId) {
        this.svg = d3.select(`#${divId}`)
            .append('svg')
            .attr('id', `${divId}-pie`)
            .attr('width', '100%')
            .attr('height', '100%')

        window.addEventListener('resize', () => {
            this._sizeArea()
            this._draw(true)
        })

        // Could pass this in
        this.margin = {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        }

        let defs = this.svg.append('defs')
        this.clipPath = defs.append('svg:clipPath')
            .attr('id', `${divId}-pie-clip`)
            .append('svg:rect')

        // Initialise
        this.graphArea = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

        // Group to draw areas in (aggregations)
        this.pieArea = this.graphArea
            .append('g')
            .attr('clip-path', `url(#${this.svgId}-clip)`)
        this.textArea = this.graphArea
            .append('g')
            .attr('clip-path', `url(#${this.svgId}-clip)`)

        this.sliceHoverListeners = []
        this.sliceEndHoverListeners = []

        this._sizeArea()
    }

    setData(data) {
        this.data = data
        this._draw()
    }

    addSliceHoverListener(l) {
        this.sliceHoverListeners.push(l)
    }

    addSliceEndHoverListener(l) {
        this.sliceEndHoverListeners.push(l)
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

        let arcGen = d3.arc().innerRadius(0).outerRadius(rad)
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

        // Placeholder - a bit shite.  Probably much better off in a legend
        let textSel = this.textArea.selectAll('text')
            .data(pie(this.data))

        textSel
            .enter()
            .append('text')
            .attr('x', d => {
                return arcGen
                    .outerRadius(d.data.active ? rad / sf : rad)
                    .startAngle(d.startAngle)
                    .endAngle(d.endAngle)
                    .centroid()[0]
            })
            .attr('y', d => {
                return arcGen
                    .outerRadius(d.data.active ? rad / sf : rad)
                    .startAngle(d.startAngle)
                    .endAngle(d.endAngle)
                    .centroid()[1]
            })
            .text(d => d.data.percentage)

        textSel
            .transition()
            // Don't transition if this is a window resize
            .duration(resize ? 0 : 500)
            .attr('x', d => {
                return arcGen
                    .outerRadius(d.data.active ? rad / sf : rad)
                    .startAngle(d.startAngle)
                    .endAngle(d.endAngle)
                    .centroid()[0]
            })
            .attr('y', d => {
                return arcGen
                    .outerRadius(d.data.active ? rad / sf : rad)
                    .startAngle(d.startAngle)
                    .endAngle(d.endAngle)
                    .centroid()[1]
            })
    }
}
