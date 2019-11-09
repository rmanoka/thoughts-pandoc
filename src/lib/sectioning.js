const {copyAttrs, closest} = require('./dom-utils.js');

function siblingAncestor(parent, element) {
    while (element && (parent !== element.parentNode))
        element = element.parentNode;
    return element;
}

module.exports = function process(element, selector='[data-header-level]') {
    const headers = element.querySelectorAll(selector);
    headers.forEach((header, idx) => {
        if (closest.call(header, '.no-sectioning')) return;
        const parent = header.parentNode;
        const level = parseInt(header.getAttribute('data-header-level'), 10);
        let nextMarker = null;
        for(let jdx = idx+1; jdx<headers.length; jdx++) {
            const jLevel = parseInt(headers[jdx].getAttribute('data-header-level'), 10);
            if (jLevel <= level) {
                nextMarker = headers[jdx];
                break;
            }
        }
        nextMarker = nextMarker && siblingAncestor(parent, nextMarker);

        const section = document.createElement('section');
        copyAttrs(header, section);

        section.setAttribute('data-section-level', section.getAttribute('data-header-level'));
        section.removeAttribute('data-header-level');

        header.removeAttribute('id');
        header.classList.add('section-header');
        parent.insertBefore(section, header);
        let el = header.nextSibling;
        section.appendChild(header);

        const sectionContent = document.createElement('div');
        sectionContent.setAttribute('class', 'section-content');
        section.appendChild(sectionContent);

        for(let nel; el && (el !== nextMarker) ; el=nel) {
            nel = el.nextSibling;
            sectionContent.appendChild(el);
        }
    });
};
