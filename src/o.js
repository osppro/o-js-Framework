class OComponent {
  constructor(element, props) {
    this.element = element;
    this.props = props;
    this.data = {};
    this.events = {};
    this.state = {};
    this.mounted = false;
  }

  render() {
    const html = this.template(this.data);
    this.element.innerHTML = html;
  }

  update() {
    this.render();
  }

  useState(initialState) {
    this.state = initialState;
    return [this.state, (newState) => {
      this.state = newState;
      this.update();
    }];
  }

  useEffect(callback, dependencies = []) {
    if (!this.mounted) {
      callback();
      this.mounted = true;
    } else {
      const hasChangedDependencies = dependencies.some((dep, i) => dep !== this.state[`effect_${i}`]);
      if (hasChangedDependencies) {
        callback();
        dependencies.forEach((dep, i) => {
          this.state[`effect_${i}`] = dep;
        });
      }
    }
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  trigger(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }

  template(data) {
    return `
      <h1>${data.title}</h1>
      <p>${data.content}</p>
    `;
  }
}

class ORouter {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.onRouteChange = null;
    this.basePath = '/';
    this.defaultRoute = null;
  }

  route(fullPath, componentName) {
    this.routes[this.basePath + fullPath] = componentName;
  }

  setDefaultRoute(componentName) {
    this.defaultRoute = componentName;
  }

  navigate(path) {
    const fullPath = this.basePath + path;
    if (this.routes[fullPath]) {
      this.currentRoute = this.routes[fullPath];
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
    const componentClass = o.components[componentName];
    const component = new componentClass(componentElement, o.data);
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
}

class O {
  constructor() {
    this.components = {};
    this.data = {};
    this.router = new ORouter();
    this.directives = {};
  }

  component(name, componentClass) {
    this.components[name] = componentClass;
  }

  data(key, value) {
    this.data[key] = value;
  }

  route(path, componentName) {
    this.router.route(path, componentName);
  }

  setDefaultRoute(componentName) {
    this.router.setDefaultRoute(componentName);
  }

  navigate(fullPath) {
    this.router.navigate(fullPath);
  }

  directive(name, directive) {
    this.directives[name] = directive;
  }

  mount(callback) {
    this.router.navigate(window.location.pathname);
    callback();
  }

  // Server-Side Rendering (SSR)
  static renderToString(componentName, props) {
    const componentClass = this.components[componentName];
    const component = new componentClass(null, props);
    return component.template(component.data);
  }

  // API Integration
  static async fetch(url, options = {}) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
}

const o = new O();