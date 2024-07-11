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

  // Lifecycle Hooks
  beforeMount() {}
  mounted() {}
  beforeUpdate() {}
  updated() {}
  beforeUnmount() {}
  unmounted() {}

  // Computed Properties
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

    // Add an event listener for the popstate event
    window.addEventListener('popstate', () => {
      this.handlePopState();
    });

    // Handle the initial URL
    this.handleInitialURL();
  }

  handleInitialURL() {
    const currentPath = window.location.pathname.replace(this.basePath, '');
    this.navigate(currentPath || '/');
  }

  route(path, componentName) {
    this.routes[this.basePath + path] = componentName;
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
    const component = new componentClass(componentElement, {});
    component.render();
  }

  updateURL(path) {
    const fullPath = this.basePath + path;
    window.history.pushState({}, '', fullPath);
  }

  handlePopState() {
    const currentPath = window.location.pathname.replace(this.basePath, '');
    this.navigate(currentPath);
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

  // Route Parameters
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
}

class O {
  constructor(config = {}) {
    this.config = {
      baseUrl: '/o-js-Framework',
      ...config
    };
    this.components = {};
    this.data = {};
    this.router = new ORouter(this.config.baseUrl);
    this.directives = {};
    this.state = {};
  }

  component(name, componentClass) {
    this.components[name] = componentClass;
  }

  data(key, value) {
    if (typeof key === 'object') {
      Object.entries(key).forEach(([k, v]) => {
        this.data[k] = v;
      });
    } else {
      this.data[key] = value;
    }
  }

  directive(name, directive) {
    this.directives[name] = directive;
  }

  mount(rootElement, options = {}) {
    // This method is left empty, as it will be implemented in the HTML file
  }
}
