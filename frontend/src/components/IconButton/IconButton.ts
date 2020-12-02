import icons from './icons';
import iconEventKeys from "./iconEventKeys";
import './IconButton.scss';

(() => {
  const IconButton = class extends HTMLElement {
    public icontype: string;
    public color: string;
    public size: string;
    public eventKey:string;
    // public eventKeyList: string[];

    constructor() {
      super();
      this.icontype = '';
      this.color = 'white';
      this.size = '20px';
      this.eventKey = '';

      // this.eventKeyList = ['audi-source-play-or-pause', 'audi-source-stop', 'audi-source-repeat', 'audi-source-fast-rewind', 'audi-soure-fast-forward', 'audi-source-skip-prev', 'audi-source-skip-next'];

    }

    static get observedAttributes() {
      return ['icontype', 'color', 'size'];
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
      this[attrName] = newVal;
      this.render();
    }

    render() {
      this.innerHTML = `
              <div>
                  <svg
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="${this.icontype === 'blade' ? '0 0 244 245' : '0 0 24 24'}"
                  role="img"
                  width="${this.size}"
                  height="${this.size}"
                  event-key="${iconEventKeys[this.icontype]()}"
                >
                  ${icons[this.icontype](this.color)}
                </svg>
              </div>
            `;
    }
  };
  customElements.define('audi-icon-button', IconButton);
})();

export { };
