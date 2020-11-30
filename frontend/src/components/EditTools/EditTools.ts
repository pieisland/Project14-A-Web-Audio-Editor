import './EditTools.scss'

(() => {
  const EditTools = class extends HTMLElement {
    public iconlist: string[];

    constructor() {
      super();
      this.iconlist = ['cursor', 'blade', 'copy', 'cut', 'paste', 'delete', 'undo', 'redo'];

    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
              <div class="edit-tools">
                ${this.iconlist.reduce((acc, icon) => acc + `<audi-icon-button id="${icon}" color="white" icontype="${icon}" size="32px"></audi-icon-button>`, '')}
              </div>
            `;
    }
  };
  customElements.define('audi-edit-tools', EditTools);
})()

export {};