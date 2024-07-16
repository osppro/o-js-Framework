class HelloComponent extends OComponent {
  constructor(element, props) {
    super(element, props);
    this.data = { message: 'Hello, World!' };
  }

  template(data) {
    return `
      <h1>${data.message}</h1>
    `;
  }
}