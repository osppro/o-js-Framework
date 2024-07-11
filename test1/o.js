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

  beforeMount() {
    // Custom logic to be executed before the component is mounted
  }

  mounted() {
    // Custom logic to be executed after the component is mounted
  }

  beforeUpdate() {
    // Custom logic to be executed before the component is updated
  }

  updated() {
    // Custom logic to be executed after the component is updated
  }

  template(data) {
    return `
      <h1>${data.title}</h1>
      <p>${data.content}</p>
    `;
  }
}

class ORouter {
  constructor(basePath = '/') {
    this.routes = {};
    this.currentRoute = null;
    this.onRouteChange = null;
    this.basePath = basePath.replace(/\/+$/, ''); // Remove trailing slashes
    this.defaultRoute = null;
  }

  route(path, componentName) {
    // Normalize the path to remove any extra forward slashes
    const normalizedPath = `/${path.replace(/\/+/g, '/')}`;
    this.routes[this.basePath + normalizedPath] = componentName;
  }

  setDefaultRoute(componentName) {
    this.defaultRoute = componentName;
  }

  navigate(path) {
    // Normalize the path to remove any extra forward slashes
    const normalizedPath = `/${path.replace(/\/+/g, '/')}`;
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
  constructor(basePath = '/') {
    this.components = {};
    this.data = {};
    this.router = new ORouter(basePath);
    this.directives = {};
    this.eventBus = {};
  }

  component(name, componentClass) {
    this.components[name] = componentClass;
  }

  data(key, value) {
    if (typeof key === 'object') {
      Object.assign(this.data, key);
    } else {
      this.data[key] = value;
    }
    return this.data;
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

  directive(name, directive) {
    this.directives[name] = directive;
  }

  on(event, callback) {
    if (!this.eventBus[event]) {
      this.eventBus[event] = [];
    }
    this.eventBus[event].push(callback);
  }

  trigger(event, ...args) {
    if (this.eventBus[event]) {
      this.eventBus[event].forEach(callback => callback(...args));
    }
  }
}
