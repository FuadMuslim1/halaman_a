class GoBackButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <!-- Font Awesome CDN -->
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        #goBackButton {
          position: fixed;
          top: 15px;
          right: 15px;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          border: 3px solid;
          border-image: linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #8134af) 1;
          background-color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          z-index: 1002;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        #goBackButton:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        #goBackButton i {
          color: #000;
          font-size: 18px;
        }
      </style>

      <div id="goBackButton">
        <i class="fas fa-arrow-left"></i>
      </div>
    `;
  }

  connectedCallback() {
    const goBackButton = this.shadowRoot.getElementById('goBackButton');
    goBackButton.addEventListener('click', () => {
      history.back();
    });
  }
}

customElements.define('go-back-button', GoBackButton);
