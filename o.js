class OComponent {
  constructor(element, props) {
    this.element = element;
    this.props = props;
    this.data = {};
    this.state = {};
  }

  render() {
    this.element.innerHTML = this.template(this.data);
  }

  update() {
    this.render();
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.update();
  }

  template(data) {
    return `
      <h1>${data.title}</h1>
      <p>${data.content}</p>
    `;
  }
}

class ORouter {
  constructor(o) {
    this.o = o;
    this.routes = {};
    this.currentRoute = null;
    this.defaultRoute = null;
  }

  route(path, componentName) {
    this.routes[path] = componentName;
  }

  setDefaultRoute(componentName) {
    this.defaultRoute = componentName;
  }

  navigate(path) {
    if (this.routes[path]) {
      this.currentRoute = this.routes[path];
      this.renderComponent();
      this.updateURL(path);
    } else if (this.defaultRoute) {
      this.currentRoute = this.defaultRoute;
      this.renderComponent();
      this.updateURL(path);
    } else {
      this.handleNotFound();
    }
  }

  renderComponent() {
    const componentName = this.currentRoute;
    const componentElement = document.getElementById('app');
    const componentClass = this.o.components[componentName];
    const component = new componentClass(componentElement, this.o.state);
    component.render();
  }

  updateURL(path) {
    try {
      window.history.pushState({}, '', path);
    } catch (error) {
      console.error('Error updating URL:', error);
      // Fallback logic, e.g., navigate to the default route
      this.navigate(this.defaultRoute);
    }
  }

  handleNotFound() {
    console.error('404 - Page not found');
  }
}

class O {
  constructor() {
    this.components = {};
    this.state = {};
    this.router = new ORouter(this);
  }

  component(name, componentClass) {
    this.components[name] = componentClass;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateComponents();
  }

  updateComponents() {
    for (const componentName in this.components) {
      const componentElement = document.getElementById('app');
      const componentClass = this.components[componentName];
      const component = new componentClass(componentElement, this.state);
      component.render();
    }
  }

  route(path, componentName) {
    this.router.route(path, componentName);
  }

  setDefaultRoute(componentName) {
    this.router.setDefaultRoute(componentName);
  }

  navigate(path) {
    this.router.navigate(path);
  }

  mount(callback) {
    this.router.navigate(window.location.pathname);
    callback();
  }
}

const o = new O();
