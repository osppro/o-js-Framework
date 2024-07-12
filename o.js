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

  // New: Lifecycle Hooks
  beforeMount() {}
  mounted() {}
  beforeUpdate() {}
  updated() {}
  beforeUnmount() {}
  unmounted() {}

  // New: Computed Properties
  computed(data) {
    return {
      // Define computed properties here
    };
  }
}

class ORouter {
  constructor(basePath = '') {
    this.basePath = basePath;
    this.routes = {};
    this.currentRoute = null;
    this.onRouteChange = null;
    this.defaultRoute = null;
    this.events = {};
    this.middleware = [];

    // Add an event listener for the popstate event
    window.addEventListener('popstate', () => {
      this.handlePopState();
    });
  }

  handlePopState() {
    const currentPath = window.location.pathname.replace(this.basePath, '');
    this.navigate(currentPath, true);
  }

  route(path, componentName) {
    this.routes[path] = componentName;
  }

  setDefaultRoute(componentName) {
    this.defaultRoute = componentName;
  }

  navigate(path, skipPushState = false) {
    const fullPath = this.basePath + path;
    if (this.routes[path]) {
      this.currentRoute = this.routes[path];
      this.runMiddleware('before', path);
      this.renderComponent();
      this.runMiddleware('after', path);
      if (!skipPushState) {
        this.updateURL(path);
      }
    } else if (this.defaultRoute) {
      this.currentRoute = this.defaultRoute;
      this.runMiddleware('before', path);
      this.renderComponent();
      this.runMiddleware('after', path);
      if (!skipPushState) {
        this.updateURL(path);
      }
    } else {
      this.handleNotFound();
    }
  }

  renderComponent() {
    const componentName = this.currentRoute;
    const componentElement = document.getElementById('app');
    const componentClass = o.components[componentName];
    const component = new componentClass(componentElement, {});
    component.render();
  }

  updateURL(path) {
    try {
      window.history.replaceState({}, '', this.basePath + path);
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

  // New: Route Parameters
  getRouteParams(path) {
    const routes = Object.keys(this.routes);
    for (const route of routes) {
      const regex = this.getRouteRegex(route);
      const match = path.match(regex);
      if (match) {
        const params = {};
        match.slice(1).forEach((value, index) => {
          params[this.getParamName(route, index)] = value;
        });
        return params;
      }
    }
    return {};
  }

  getRouteRegex(route) {
    return new RegExp('^' + route.replace(/:\w+/g, '(\\w+)') + '$');
  }

  getParamName(route, index) {
    return route.split('/').filter(part => part.startsWith(':'))[index].slice(1);
  }

  // New: Middleware
  use(middleware) {
    this.middleware.push(middleware);
  }

  runMiddleware(type, path) {
    this.middleware.forEach(middleware => {
      if (typeof middleware[type] === 'function') {
        middleware[type](path, this);
      }
    });
  }
}

class O {
  constructor(config = {}) {
    this.config = { baseUrl: this.getBaseUrl(), ...config };
    this.components = {};
    this.data = {};
    this.router = new ORouter(this.config.baseUrl);
    this.directives = {};
    this.state = {};
    this.plugins = [];
  }

  getBaseUrl() {
    // Determine the base URL based on the current URL
    const currentUrl = new URL(window.location.href);
    const pathParts = currentUrl.pathname.split('/').filter(part => part !== '');
    const baseUrl = '/' + pathParts.slice(0, -1).join('/');
    return baseUrl;
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

  navigate(path) {
    this.router.navigate(path);
  }

  // New: Directives
  directive(name, directive) {
    this.directives[name] = directive;
    this.applyDirectives();
  }

  applyDirectives() {
    for (const [name, directive] of Object.entries(this.directives)) {
      const elements = document.querySelectorAll(`[${name}]`);
      elements.forEach(element => {
        directive(element, this);
      });
    }
  }

  mount(callback) {
    this.router.navigate(window.location.pathname);
    callback();
  }

  // New: Global State Management
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateComponents();
  }

  updateComponents() {
    Object.values(this.components).forEach(component => {
      component.update();
    });
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

  // New: Nested Routing
  registerNestedRoute(parentPath, childPath, componentName) {
    const fullPath = `${parentPath}/${childPath}`;
    this.router.route(fullPath, componentName);
  }

  renderNestedComponent(parentElement, componentName, props) {
    const componentClass = this.components[componentName];
    const component = new componentClass(parentElement, props);
    component.render();
  }

  // New: Middleware
  use(middleware) {
    this.router.use(middleware);
  }

  // New: Plugins
  use(plugin) {
    this.plugins.push(plugin);
    plugin.install(this);
  }

  // New: Dynamic Imports
  async loadComponent(componentName) {
    const componentClass = await import(`./components/${componentName}.js`).then(module => module.default);
    this.components[componentName] = componentClass;
    return componentClass;
  }

  // New: Dependency Injection
  register(serviceName, service) {
    this[serviceName] = service;
  }

  get(serviceName) {
    return this[serviceName];
  }

  // New: Error Handling
  handleError(error) {
    console.error('Global error:', error);
    this.plugins.forEach(plugin => {
      if (typeof plugin.onError === 'function') {
        plugin.onError(error);
      }
    });
  }
}

const o = new O();