class OComponent {
  constructor(element, props) {
    this.element = element;
    this.props = props;
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
    this.onRouteChange = null;
    this.basePath = '';
    this.defaultRoute = null;
  }

  route(fullPath, componentName) {
    // Normalize the fullPath to remove any extra forward slashes
    const normalizedPath = fullPath.replace(/\/+/g, '/');
    this.routes[this.basePath + normalizedPath] = componentName;
  }

  setDefaultRoute(componentName) {
    this.defaultRoute = componentName;
  }

  navigate(path) {
    // Normalize the path to remove any extra forward slashes
    const normalizedPath = path.replace(/\/+/g, '/');
    const fullPath = this.basePath + normalizedPath;

    if (this.routes[fullPath]) {
      this.currentRoute = this.routes[fullPath];
      this.renderComponent();
      this.updateURL(normalizedPath);
    } else if (this.defaultRoute) {
      this.currentRoute = this.defaultRoute;
      this.renderComponent();
      this.updateURL(normalizedPath);
    } else {
      this.handleNotFound();
    }
  }

  renderComponent() {
    const componentName = this.currentRoute;
    const componentElement = document.getElementById('app');
    const componentClass = this.o.components[componentName];
    const component = new componentClass(componentElement, this.o.data);
    component.render();
  }

  updateURL(path) {
    try {
      let url = new URL(window.location.href);
      url.pathname = this.basePath + path;
      window.history.pushState({}, '', url.toString());
    } catch (error) {
      console.error('Error updating URL:', error);
      // Fallback logic, e.g., navigate to the default route
      this.navigate(this.defaultRoute);
    }
  }

  handleNotFound() {
    console.error('404 - Page not found');
    this.trigger('404');
  }

  trigger(event) {
    if (this.onRouteChange) {
      this.onRouteChange(event);
    }
  }
}

class O {
  constructor() {
    this.components = {};
    this.data = {};
    this.router = new ORouter(this);
  }

  component(name, component) {
    this.components[name] = component;
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
    if (callback) {
      callback();
    }
  }
}
