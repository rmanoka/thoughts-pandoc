import slugify from '../utils/slugify.js';
import {closest, moveChildren} from '../utils/dom.js';

export default function(root, selector='[data-header-level]') {
    root.querySelectorAll(selector).forEach((header) => {
        if (closest.call(header, '.no-header-annotation')) {
            header.removeAttribute('data-header-level');
            return;
        }

        let id = header.id;
        if (!id) {
            id = slugify(header.textContent).toLowerCase();
            header.setAttribute('id', id);
        }

        const anchor = document.createElement('a');
        anchor.setAttribute('href', `#${id}`);

        moveChildren(anchor, header);
        header.appendChild(anchor);

        // header.innerHTML = `<a href="#${id}">${header.textContent}</a>`;
    });
}
