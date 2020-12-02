'use strict';

const dataURL = `https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json`;

const pullData = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const createTree = async () => {
  const data = await pullData(dataURL);
  const margin = {
    top: 5,
    left: 5,
    right: 50,
    bottom: 150,
  };
  const content = document.querySelector('.content');
  const svgContainer = document.querySelector('.svg-container');
  const footer = document.querySelector('.footer');
  const height = footer.offsetTop - svgContainer.offsetTop - 25;
  const width = content.clientWidth;
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0);
  const svg = d3
    .select('.svg-container')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'none');
  const root = d3
    .hierarchy(data)
    .sum((d) => d.value)
    .sort((a, b) => b.data.value - a.data.value);
  d3
    .treemap()
    .size([
      width - margin.left - margin.right,
      height - margin.top - margin.bottom,
    ])(root);
  const colorScale = d3.scaleOrdinal(d3.schemeSet2);
  const group = svg
    .selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('class', 'tile-group')
    .attr('x', (d) => d.x0 + margin.left)
    .attr('y', (d) => d.y0 + margin.top)
    .attr(
      'transform',
      (d) => `translate(${d.x0 + margin.left},${d.y0 + margin.top})`
    );
  group
    .append('rect')
    .attr('class', 'tile')
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0)
    .attr('data-name', (d) => d.data.name)
    .attr('data-category', (d) => d.data.category)
    .attr('data-value', (d) => d.data.value)
    .style('fill', (d) => colorScale(d.data.category))
    .on(
      'mouseover pointerover pointerenter pointerdown pointermove gotpointercapture touchstart touchmove',
      (e) => {
        tooltip.transition().duration(300).style('opacity', 1);
        tooltip.attr('data-value', `${e.target.dataset.value}`);
        tooltip
          .html(
            `
        <p>${e.target.dataset.name}</p>
        <p>Genre: ${e.target.dataset.category}</p>
        <p>${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        })
          .format(e.target.dataset.value)
          .replace('.00', '')}</p>
            `
          )
          .style('position', 'absolute')
          .style('left', `${e.clientX - 20}px`)
          .style('top', `${e.clientY - 60}px`);
      }
    )
    .on(
      'mouseout pointerout pointerup pointercancel pointerleave lostpointercapture touchend',
      () => {
        tooltip.transition().duration(500).style('opacity', 0);
      }
    );
  group
    .append('text')
    .selectAll('tspan')
    .data((d) => {
      let titleArray = d.data.name.trim().split(' ');

      if (titleArray.length > 2) {
        titleArray = titleArray.filter((x, i) => i <= 1);
        titleArray.push('...');
      }

      return titleArray;
    })
    .enter()
    .append('tspan')
    .attr('class', 'tile-label')
    .attr('x', width / 300)
    .attr('y', (d, i) => i * (height / 100) + height / 300)
    .attr('alignment-baseline', 'hanging')
    .text((d) => d)
    .style('font-size', (d) => height / 100);
  const legend = svg
    .append('g')
    .attr(
      'transform',
      `translate(${margin.left},${height - margin.bottom / 1.2})`
    )
    .attr('id', 'legend');
  legend.append('text').text('LEGEND');
  const sqSize =
    (width - margin.left - margin.right) / 7 > 15
      ? 15
      : (width - margin.left - margin.right) / 7;
  const offset = height / 100;
  legend
    .selectAll(null)
    .data(colorScale.domain())
    .enter()
    .append('rect')
    .attr('class', 'legend-item')
    .attr('x', 0)
    .attr('y', (d, i) => i * sqSize + offset)
    .attr('width', sqSize)
    .attr('height', sqSize)
    .attr('fill', (d) => colorScale(d));
  legend
    .selectAll(null)
    .data(colorScale.domain())
    .enter()
    .append('text')
    .text((d) => d)
    .attr('id', 'legend-text')
    .attr('x', sqSize + offset)
    .attr('y', (d, i) => i * sqSize + offset / 2 + offset + sqSize / 2);
};

createTree();
