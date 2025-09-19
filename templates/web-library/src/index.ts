export class CounterElement extends HTMLElement {
   private count = 0;

   connectedCallback() {
      this.innerHTML = `
         <button id="counter">Count: ${this.count}</button>
      `;

      this.querySelector("#counter")?.addEventListener("click", () => {
         this.count++;
         const button = this.querySelector("#counter");
         if (button) {
            button.textContent = `Count: ${this.count}`;
         }
      });
   }
}

customElements.define("my-counter", CounterElement);